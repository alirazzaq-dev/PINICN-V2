// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILPLokcerManager {
    function createLPLcoker(address _owner, address _token, uint _numOfTokens, uint _unlockTime) external returns (uint);
}