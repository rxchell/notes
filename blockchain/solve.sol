pragma solidity ^0.8.17;

import "./challengeOne.sol";
import "./challengeTwo.sol";
import "./challengeThree.sol";

// this contract solution is complete and provided for your reference
// on how to interact with external contracts
contract chall1solve {

	challengeOne _chall;

	constructor (address _address) {
		// we reference the existing contract
		_chall = challengeOne(_address);
	}

	function solve() external {
		// withdraw 5 ether to solve the challenge!
		_chall.withdrawMoney(_chall.password, 5e18);
	}

	receive() payable external {}

}

// this contract is a skeleton, and requires you to fill up as necessary
contract chall2solve {

	challengeTwo _chall;

	constructor (address _address) payable {
		_chall = challengeTwo(payable(_address));
	}

	function solve() external {
		// add some code here!
	}

	// this function will be called when money is sent to this contract
	receive() payable external {
		// add some code here!
	}
}

// this contract is a skeleton, and requires you to fill up as necessary
contract chall3solve {

	challengeThree _chall;
	// uncomment if you need this :)
	// uint256 internal _counter;

	constructor (address _address) payable {
		_chall = challengeThree(payable(_address));
		// uncomment if you need this :)
		// _counter = 0;
	}

	receive() external payable {
		// add some code here!
	}
	
	function solve() external {
		// you can call a function while sending ether like this!
		// _chall.deposit{value: 5 ether}();
	}
}
