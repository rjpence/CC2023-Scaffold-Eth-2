//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// For ChainlinkFunctions
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
  * @author Jason Banks, Randy Pence
 */
contract YourContract is FunctionsClient, ConfirmedOwner {
	// This extends the functionality of bytes32 with the ECDSA functions
	using ECDSA for bytes32;
	using FunctionsRequest for FunctionsRequest.Request;

	struct User {
		uint256 points;
		uint256 rewards;
		uint256 lastRewardsPerEP;
		uint256 latestConsumptionTimestamp;
		uint256 epochEntryPoints;
		uint256 epochPoints;
	}

	// State Variables
	// address public override owner;
	uint256 public totalEpochPoints; // total points among all users
	uint256 public totalItemsConsumed; // total items consumed
	uint256 public proposalReward; // configurable reward for proposing a valid content item
	uint256 public epochTimestamp; // timestamp of when the current epoch began
	mapping (address => User) public users;
	mapping (bytes32 => bytes32) public requestIdsToHashes;
	mapping (bytes32 => address) public hashesToProposers;

	uint256 public distributableRewards;
	uint256 public totalRewardsPerEP;

	// For Chainlink Functions
	bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
	string public chainlinkFunctionsSource;

	// For Chainlink Functions
    error UnexpectedRequestID(bytes32 requestId);

	event ContentItemConsumed(address indexed _consumer, bytes32 indexed _contentItemHash, address _signer);
	event ContentItemProposed(address indexed _proposer, bytes32 indexed _contentItemHash, string[] _contentItemArgs);
	event ValidationRequested(bytes32 indexed _requestId, bytes32 indexed _contentItemHash);
	event ValidationResponseReceived(bytes32 indexed _requestId, bytes32 indexed _contentItemHash, bool _isContentItemValid);
	event ValidProposalRewarded(address indexed _proposer, bytes32 indexed _contentItemHash, uint256 _proposalReward, uint256 _totalProposerPoints);
	event ProposalRewardChanged(uint256 _proposalReward);
	event ChainlinkFunctionsSourceChanged(string _source);
	event IndividualRewardsDistributed(address indexed _earner, address indexed _rewardee, uint256 _rewards, uint256 _epochPoints, uint256 _totalRewardsPerEP, uint256 _lastRewardsPerEP);
	event RewardsDistributed(uint256 _previousTotalRewardsPerEP, uint256 _totalRewardsPerEP, uint256 _previousDistributableRewards, uint256 _totalPoints);
	event DistributableRewardsAdded(address indexed _by, uint256 _amount);
	event RewardsWithdrawn(address indexed _user, uint256 _amount);
	event EpochEnded();
	event EpochEntered(address indexed _user, uint256 _epochEntryPoints);
	event EpochPointsEarned(address indexed _user, uint256 _epochPoints);
	event UserTattledOn(address indexed _user, address indexed _tattler);

	// For Chainlink Functions
    event Response(bytes32 indexed requestId, bytes response, bytes err);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(
		uint256 _proposalReward, 
        address router
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
		proposalReward = _proposalReward;
		epochTimestamp = block.timestamp;
	}

	// TODO: add a function to show a user the rewards they can withdraw

	function withdrawRewards() public {
		// Distribute rewards to the user based on the points they have accumulated
		// since the last time they were distributed and
		// reset the lastRewardsPerEP to the current totalRewardsPerEP
		// (as the new floor for the user's per point rewards)
		_settleIndividualRewards(msg.sender, msg.sender);

		User storage user = users[msg.sender];

		require(user.rewards > 0, "No rewards to withdraw");

		// TODO: transfer from this contract to msg.sender
		uint256 amount = user.rewards;
		user.rewards = 0;

		emit RewardsWithdrawn(msg.sender, amount);
	}

	// Note: ending the epoch actually extends users ability to be eligible
	// 		 for rewards by up to a day
	function endEpoch() public {
		// Distribute the remaining rewards to all users
		_distributeRewards();

		// Reset the epochTimestamp
		epochTimestamp = block.timestamp;

		emit EpochEnded();
	}

	// The contract distributes the rewards by points
	function _distributeRewards() private {
		// TODO: confirm that 18 decimals is the correct amount
		require(distributableRewards >= 1*10**18, "Rewards must be at least 1 token");
		require(totalEpochPoints > 0, "No epoch points to distribute rewards");
		
		uint256 previousTotalRewardsPerEP = totalRewardsPerEP;
		uint256 previousDistributableRewards = distributableRewards;
		totalRewardsPerEP += previousDistributableRewards / totalEpochPoints;
		distributableRewards = 0;

		emit RewardsDistributed(previousTotalRewardsPerEP, totalRewardsPerEP, previousDistributableRewards, totalEpochPoints);
	}

	// Distribute rewards to the rewardee based on the epoch points the earner earned
	// since the last time they rewards were settled by the earner and
	// reset the lastRewardsPerEP to the current totalRewardsPerEP for the earner
	// (as the new floor for calculating the user's per point rewards)
	function _settleIndividualRewards(address _earner, address _rewardee) private {
		User storage earner = users[_earner];
		User storage rewardee = users[_rewardee];

		uint256 lastRewardsPerEP = earner.lastRewardsPerEP;
		uint256 rewards = earner.epochPoints * (totalRewardsPerEP - lastRewardsPerEP);
		rewardee.rewards += rewards;
		earner.lastRewardsPerEP = totalRewardsPerEP;
		
		emit IndividualRewardsDistributed(_earner, _rewardee, rewards, earner.epochPoints, totalRewardsPerEP, lastRewardsPerEP);
	}

	// This function lets the contract know that there are _amount new rewards available
	// This function should call the token contract to transfer _amount
	// from the caller to the contract
	function addDistributableRewards(uint256 _amount) public {
		// TODO: transfer _amount from msg.sender to this contract

		distributableRewards += _amount;

		emit DistributableRewardsAdded(msg.sender, _amount);
	}

	function setChainlinkFunctionsSource(string memory _source) public onlyOwner {
		chainlinkFunctionsSource = _source;

		emit ChainlinkFunctionsSourceChanged(_source);
	}

	function setProposalReward(uint256 _proposalReward) public onlyOwner {
		proposalReward = _proposalReward;

		emit ProposalRewardChanged(_proposalReward);
	}

	//Upon executing function, totalPoints adds one more total read and points one more read per user 
	function userAction(address _user, bytes32 _contentItemHash, bytes memory _signedContentItemHash) onlyOwner public  {
		// TODO: Make the number of points a constant or a configurable value
		uint256 consumptionPoints = 10;
 		// Recover the signer from the signature
        address signer = _contentItemHash.toEthSignedMessageHash().recover(_signedContentItemHash);

		// Key centrally-added content items to the owner so that they cannot be proposed again
		if (hashesToProposers[_contentItemHash] == address(0)) hashesToProposers[_contentItemHash] = msg.sender;

        // Ensure the signer is _user
        require(signer == _user, "Invalid signature");
		

		User storage user = users[_user];

		// Total consumption is tracked, so that users can benefit in future epochs
		// even if they do not maintain eligibility in the current epoch
		user.points += consumptionPoints;
		totalItemsConsumed +=1;

		emit ContentItemConsumed(_user, _contentItemHash, signer);

		// If the rewards per point have changed
		// then either the epoch has changed since the last time the user consumed content or
		// the user is new
		if (user.lastRewardsPerEP != totalRewardsPerEP) {
			// Distribute rewards to the user based on the points they accumulated in the previous epochs
			// - A user who was eligible in a previous epoch could make the choice not to re-enter until multiple epochs later
			// and still receive rewards for the previous epochs, even the ones they didn't participat in
			// because their epoch points will remain part of the total epoch points by which rewards are distributed.
			// - Tattling is the mechanism that is meant to balance this, because a user's accumulated rewards will be
			// rewarded to whoever tattles on the user.
			// - A new user will not have any points from previous epochs, so they will not receive any rewards,
			// but their lastRewardsPerEP will be set to the current totalRewardsPerEP so they can earn from the current epoch
			_settleIndividualRewards(_user, _user);

			// Set the user's points for the new epoch
			user.epochPoints = 0;
		}

		// If the block timestamp is within 1 day of the epoch timestamp,
		// the user enters the new epoch and earns points for consuming content
		if (block.timestamp <= epochTimestamp + 1 days) {
			// We separately track points added in the epoch to facilitate rewarding tattlers
			user.epochEntryPoints = user.points;
			user.epochPoints = user.points;
			totalEpochPoints += user.points;
			
			emit EpochEntered(_user, user.epochEntryPoints);
			emit EpochPointsEarned(_user, consumptionPoints);
		}
		// If the epoch has not just started, then the user can only earn epoch points
		// if they have consumed content every day in the current epoch
		else if (
			user.epochPoints > 0 &&
			block.timestamp <= user.latestConsumptionTimestamp + 1 days
		) {
			user.epochPoints += consumptionPoints;
			totalEpochPoints += consumptionPoints;

			emit EpochPointsEarned(_user, consumptionPoints);
		}
	}

	function tattle(address _user) public {
		User storage tattler = users[msg.sender];
		User storage user = users[_user];

		// TODO: confirm that tattler is still eligible for rewards in addition to having epoch points--[mark ineligible if not]
		require(isEligible(tattler), "Only eligible users can tattle");
		require(hasEpochPoints(user), "User has no epoch points");
		require(hasMissedADay(user), "User hasn't missed a day");

		// If the rewards per point have changed
		// then the user's points are from previous epochs and
		// the tattler gets the user's rewards
		if (user.lastRewardsPerEP != totalRewardsPerEP) {
			// Fix to settle them to the tattler and not the user
			_settleIndividualRewards(_user, msg.sender);

			// Remove the user's epoch points from the total epoch points
			totalEpochPoints -= (user.epochEntryPoints + user.epochPoints);
		}
		// If the rewards per point have not changed
		// then the user's points are from the current epoch and
		// the tattler gets the user's newly accumulated epoch points
		else {
			uint256 tattlePoints = user.epochPoints - user.epochEntryPoints;
			tattler.epochPoints += tattlePoints;

			emit EpochPointsEarned(msg.sender, tattlePoints);

			// Remove the user's epoch entry points from the total epoch points
			totalEpochPoints -= user.epochEntryPoints;
		}

		user.epochPoints = 0;

		emit UserTattledOn(_user, msg.sender);
	}

	// A user is only eligible if they have consumed content daily in the current epoch, which means:
	// - they have epoch points and
	// - they have consumed content daily in the current epoch
	function isEligible(User memory _user) public view returns (bool) {

		if (hasEpochPoints(_user) && !hasMissedADay(_user)) return true;

		return false;
	}

	function hasEpochPoints(User memory user) private pure returns (bool) {
		return user.epochPoints > 0;
	}

	// A user has missed a day if:
	// - the current epoch more than 1 day old and
	// - more than 1 day has passed since the user's latest consumption
	function hasMissedADay(User memory user) private view returns (bool) {
		return block.timestamp >= epochTimestamp + 1 days ||
			block.timestamp >= user.latestConsumptionTimestamp + 1 days;
	}

	// TODO: store successfully proposed content items so that they cannot be proposed again
	// TODO: require users to pay the LINK for the Chainlink Functions call
	// TODO: confirm that the hash of the contentItemArgs matches _contentItemHash
	// Marked ext because it will make an external call to Chainlink Functions
	function extProposeContentItem(
		bytes32 _contentItemHash,
        bytes memory _encryptedSecretsUrls,
        uint8 _donHostedSecretsSlotID,
        uint64 _donHostedSecretsVersion,
        string[] memory _contentItemArgs,
        bytes[] memory _bytesArgs,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donId
	) public {
		require(hashesToProposers[_contentItemHash] == address(0), "Content item already proposed");
		hashesToProposers[_contentItemHash] = msg.sender;
		emit ContentItemProposed(msg.sender, _contentItemHash, _contentItemArgs);

		// Send _url and _title to Chainlink Functions to validate the propriety of the content item
		bytes32 requestId = sendValidationRequest(
			chainlinkFunctionsSource,
			_encryptedSecretsUrls,
			_donHostedSecretsSlotID,
			_donHostedSecretsVersion,
			_contentItemArgs,
			_bytesArgs,
			_subscriptionId,
			_gasLimit,
			_donId
		);

		requestIdsToHashes[requestId] = _contentItemHash;
		emit ValidationRequested(requestId, _contentItemHash);
	}

	// TODO: Add modifier that only allows FunctionsConsumer contract to call this function
	function _handleValidationResponse(bytes32 _requestId, bool _isContentItemValid) private {
		bytes32 contentItemHash = requestIdsToHashes[_requestId];
		address proposer = hashesToProposers[contentItemHash];
		require(proposer != address(0), "Invalid requestId");

		delete hashesToProposers[contentItemHash];
		delete requestIdsToHashes[_requestId];

		emit ValidationResponseReceived(_requestId, contentItemHash, _isContentItemValid);

		if (_isContentItemValid) {
			_rewardValidProposal(proposer, contentItemHash);
		}
	}

	function _rewardValidProposal(address _proposer, bytes32 _contentItemHash) private {
		users[_proposer].points += proposalReward;
		totalEpochPoints += proposalReward;

		emit ValidProposalRewarded(_proposer, _contentItemHash, proposalReward, users[_proposer].points);
	}

	// Chainlink Functions functions
    /**
     * @notice Send a simple request
     * @param source JavaScript source code
     * @param encryptedSecretsUrls Encrypted URLs where to fetch user secrets
     * @param donHostedSecretsSlotID Don hosted secrets slotId
     * @param donHostedSecretsVersion Don hosted secrets version
     * @param args List of arguments accessible from within the source code
     * @param bytesArgs Array of bytes arguments, represented as hex strings
     * @param subscriptionId Billing ID
     */
	// TODO: determine if the gas saved by using sendCBOR is worth the opacity
    function sendValidationRequest(
        string memory source,
        bytes memory encryptedSecretsUrls,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion,
        string[] memory args,
        bytes[] memory bytesArgs,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donID
    ) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (encryptedSecretsUrls.length > 0)
            req.addSecretsReference(encryptedSecretsUrls);
        else if (donHostedSecretsVersion > 0) {
            req.addDONHostedSecrets(
                donHostedSecretsSlotID,
                donHostedSecretsVersion
            );
        }
        if (args.length > 0) req.setArgs(args);
        if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;
        emit Response(requestId, s_lastResponse, s_lastError);
        _handleValidationResponse(requestId, abi.decode(response, (bool)));
    }	
}
