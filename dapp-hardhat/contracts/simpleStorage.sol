// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 public number;
    string public name;

    constructor(string memory _name) {
        name = _name;
    }

    function store(uint256 _number) public {
        number = _number;
    }

    function retrieve() public view returns (uint256) {
        return number;
    }
}