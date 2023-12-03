//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
  * @author rjpence
 */
contract YourContract {
	// This extends the functionality of bytes32 with the ECDSA functions
	using ECDSA for bytes32;

	struct Proposal {
		bytes32 contentItemHash;
		address proposer;
	}

	// State Variables
	address public owner;
	uint256 public readCounter = 0; //total reads among all users
	mapping (address => uint) public userReadCounter; //individual total reads among users
	mapping (bytes32 => Proposal) public proposals; //mapping of content item hashes to proposals (proposed content items

	event ContentItemConsumed(address indexed _consumer, bytes32 indexed _contentItemHash, address _signer);
	event ContentItemProposed(address indexed _proposer, bytes32 indexed _contentItemHash, string _url, string _title, bytes32 _requestId);

	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not owner");
		_;
	}

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	//Upon executing function, readCounter adds one more total read and userReadCounter one more read per user 
	function userAction(address _user, bytes32 _contentItemHash, bytes memory _signedContentItemHash) isOwner public  {
 		// Recover the signer from the signature
        address signer = _contentItemHash.toEthSignedMessageHash().recover(_signedContentItemHash);

        // Ensure the signer is _user
        require(signer == _user, "Invalid signature");
		
		_contentItemHash;
		_signedContentItemHash;
		readCounter +=1;
		userReadCounter[_user] += 1;

		emit ContentItemConsumed(_user, _contentItemHash, signer);
	}

	function proposeContentItem(bytes32 _contentItemHash, string memory _url, string memory _title) public {
		// Send _url and _title to Chainlink Functions to validate the propriety of the content item
		// replace mockRequestId with the requestId returned by Chainlink Functions
		bytes32 mockRequestId = blockhash(block.number - 1);
		proposals[mockRequestId] = Proposal(_contentItemHash, msg.sender);
		emit ContentItemProposed(msg.sender, _contentItemHash, _url, _title, mockRequestId);
	}
}
