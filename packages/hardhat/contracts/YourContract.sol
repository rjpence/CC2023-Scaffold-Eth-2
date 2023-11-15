//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
	// State Variables
	address public immutable owner;
	string public Salutation = "Yo!";
	uint256 public readCounter = 0;
	mapping (address => uint) public userReadCounter;



	function userAction() public returns (bool success ) {
		readCounter +=1;
		userReadCounter[msg.sender] += 1;
	}

	

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
