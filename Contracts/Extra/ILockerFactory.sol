// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract ILockerFactory  {

    enum Type {TOKEN, LPTOKEN}
    // function createLcoker(Type _type, address _token, uint _numOfTokens, uint _unlockTime) virtual external;
    function createLcoker(Type _type, address _owner, address _tokenAddress, uint _numOfTokens, uint _unlockTime) virtual external;
}