//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./FunctionsConsumer.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
  * @author Jason Banks, Randy Pence
 */
contract YourContract is FunctionsConsumer {
	// This extends the functionality of bytes32 with the ECDSA functions
	using ECDSA for bytes32;

	// State Variables
	// address public override owner;
	uint256 public totalPoints; // total points among all users
	uint256 public totalItemsConsumed; // total items consumed
	uint256 public proposalReward; // configurable reward for proposing a valid content item
	mapping (address => uint) public points; // points per user
	mapping (bytes32 => bytes32) public requestIdsToHashes;
	mapping (bytes32 => address) public hashesToProposers;

	event ContentItemConsumed(address indexed _consumer, bytes32 indexed _contentItemHash, address _signer);
	event ContentItemProposed(address indexed _proposer, bytes32 indexed _contentItemHash, string _url, string _title);
	event ValidationRequested(bytes32 indexed _requestId, bytes32 indexed _contentItemHash);
	event ValidationResponseReceived(bytes32 indexed _requestId, bytes32 indexed _contentItemHash, bool _isContentItemValid);
	event ValidProposalRewarded(address indexed _proposer, bytes32 indexed _contentItemHash, uint256 _proposalReward, uint256 _totalProposerPoints);
	event ProposalRewardChanged(uint256 _proposalReward);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(uint256 _proposalReward, address _router) FunctionsConsumer(_router) {
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
	function extProposeContentItem(bytes32 _contentItemHash, string memory _url, string memory _title) public {
		require(hashesToProposers[_contentItemHash] == address(0), "Content item already proposed");
		hashesToProposers[_contentItemHash] = msg.sender;
		emit ContentItemProposed(msg.sender, _contentItemHash, _url, _title);

		// Send _url and _title to Chainlink Functions to validate the propriety of the content item
		// replace mockRequestId with the requestId returned by Chainlink Functions
		bytes32 mockRequestId = blockhash(block.number - 1);
		requestIdsToHashes[mockRequestId] = _contentItemHash;
		emit ValidationRequested(mockRequestId, _contentItemHash);
	}

	// TODO: Add modifier that only allows FunctionsConsumer contract to call this function
	function handleValidationResponse(bytes32 _requestId, bool _isContentItemValid) public {
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
}
