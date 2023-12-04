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


	// State Variables
	// address public override owner;
	uint256 public totalPoints; // total points among all users
	uint256 public totalItemsConsumed; // total items consumed
	uint256 public proposalReward; // configurable reward for proposing a valid content item
	mapping (address => uint) public points; // points per user
	mapping (bytes32 => bytes32) public requestIdsToHashes;
	mapping (bytes32 => address) public hashesToProposers;

	// For Chainlink Functions
	bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

	// For Chainlink Functions
    error UnexpectedRequestID(bytes32 requestId);

	event ContentItemConsumed(address indexed _consumer, bytes32 indexed _contentItemHash, address _signer);
	event ContentItemProposed(address indexed _proposer, bytes32 indexed _contentItemHash, string[] _contentItemArgs);
	event ValidationRequested(bytes32 indexed _requestId, bytes32 indexed _contentItemHash);
	event ValidationResponseReceived(bytes32 indexed _requestId, bytes32 indexed _contentItemHash, bool _isContentItemValid);
	event ValidProposalRewarded(address indexed _proposer, bytes32 indexed _contentItemHash, uint256 _proposalReward, uint256 _totalProposerPoints);
	event ProposalRewardChanged(uint256 _proposalReward);

	// For Chainlink Functions
    event Response(bytes32 indexed requestId, bytes response, bytes err);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(
		uint256 _proposalReward, 
        address router
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
		proposalReward = _proposalReward;
	}

	function setProposalReward(uint256 _proposalReward) public onlyOwner {
		proposalReward = _proposalReward;

		emit ProposalRewardChanged(_proposalReward);
	}

	//Upon executing function, totalPoints adds one more total read and points one more read per user 
	function userAction(address _user, bytes32 _contentItemHash, bytes memory _signedContentItemHash) onlyOwner public  {
 		// Recover the signer from the signature
        address signer = _contentItemHash.toEthSignedMessageHash().recover(_signedContentItemHash);

        // Ensure the signer is _user
        require(signer == _user, "Invalid signature");
		
		_contentItemHash;
		_signedContentItemHash;
		totalPoints +=1;
		totalItemsConsumed +=1;
		points[_user] += 1;

		emit ContentItemConsumed(_user, _contentItemHash, signer);
	}

	// Marked ext because it will make an external call to Chainlink Functions
	function extProposeContentItem(
		bytes32 _contentItemHash,
		string memory _source,
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
			_source,
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
		points[_proposer] += proposalReward;
		totalPoints += proposalReward;

		emit ValidProposalRewarded(_proposer, _contentItemHash, proposalReward, points[_proposer]);
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
