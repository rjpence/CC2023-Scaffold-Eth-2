//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
  * @author rjpence
 */
contract YourContract {
	// State Variables
	address public immutable owner;
	string public Salutation = "Yo!"; //hello world
	uint256 public readCounter = 0; //total reads among all users
	mapping (address => uint) public userReadCounter; //individual total reads among users


	//Upon executing function, readCounter adds one more total read and userReadCounter one more read per user 
	function userAction() public  {
		readCounter +=1;
		userReadCounter[msg.sender] += 1;
	}

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}
}
