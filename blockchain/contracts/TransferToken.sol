// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransferToken {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Function to transfer 10 ETH from a specific address (from) to another address (recipient)
    function transfer10ETH(address from, address payable recipient) public {
        require(from == msg.sender, "Caller is not the specified sender"); // Ensure caller is the specified 'from' address
        uint amount = 10 ether;  // 10 ETH (1 ether is 1 * 10^18 wei)
        require(address(this).balance >= amount, "Insufficient contract balance");

        // Transfer 10 ETH to the recipient
        recipient.transfer(amount);
    }

    // Function to receive ETH (so the contract can hold ETH)
    receive() external payable {}
}
