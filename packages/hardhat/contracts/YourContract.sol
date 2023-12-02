//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
  * @author rjpence
 */
contract YourContract {
	using FunctionsRequest for FunctionsRequest.Request;

	bytes32 public s_lastRequestId;
	bytes public s_lastResponse;
	bytes public s_lastError;
	// State Variables
	address public owner;
	uint256 public readCounter = 0; //total reads among all users
	mapping (address => uint) public userReadCounter; //individual total reads among users
	string  public submittedContent;
	mapping (address => string) public userSubmittedContent;

	//chainlink stuff

	// link token

	string source = "return Functions.encodeString('true')";

    uint32 gasLimit = 300000;
	// Functions router for Mumbai
	address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;


	// donID for Mumbai
	//fun-avalanche-fuji-1            
	bytes32 donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;

	event Response(bytes32 indexed requestId, string character, bytes response, bytes err);

	event LogContentConsumed(address indexed sender, string message);

	event ContentItemProposed(address indexed sender, string url, string title);

	event ContentAdded(address indexed sender, bytes32 indexed submittedContent);

	
	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts

	constructor() FunctionsClient(router)

	constructor(address _owner) {
		_owner;
	}

	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	//Upon executing function, readCounter adds one more total read and userReadCounter one more read per user 
	function userAction() public  {
		readCounter +=1;
		userReadCounter[msg.sender] += 1;
		emit LogContentConsumed(msg.sender, "Content Consumed");
		console.log("Content Consumed");
		
	}
	/*
	- Front-end sends transaction to the blockchain
	- Blockchain stores proposed content item
	- Blockchain uses Chainlink Functions to validate proposed content
	- Chainlink Functions calls OpenAi
	- Chainlink Functions parses result
	- Chainlink Functions sends result to the blockchain—TBC: can we have Chainlink Functions call different functions on the smart contract based on the result, rather than having the logic to understand the result in a blockchain function?
	- Blockchain stores result from Chainlink Functions
	- Blockchain emits an event
	- Front-end updates with information from event
	- If OpenAI deems the content valid, the front-end sends the content item to the back-end to be included in the database
	*/

	function proposeContentItem(string memory _url, string memory _title) public {
		
		emit ContentItemProposed(msg.sender, _url, _title);
		//send transaction request to chainlink


	}
/*
	modifier isApproved() {
		require(1 == 1, "Content not approved"); 
		_;
	}
	Function to verify proposed content
	function addUserContent() public {
		userSubmittedContent[msg.sender] = submittedContent;
		emit ContentAdded(msg.sender, "Content Added!");
		console.log("User content added");
	}
	*/


}
