// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Locker is Context {
    
    using SafeMath for uint;

    address private master;
    LockerInfo internal lockerInfo;

    enum Status {LOCKED, WITHDRAWED}
    enum Type {TOKEN, LPTOKEN}

    struct LockerInfo {
        uint id;
        address owner; 
        IERC20 token;
        uint numOfTokens;
        uint lockTime;
        uint unlockTime;
    }

    event Locked (uint id, address owner, address token, uint numOfTokens, uint unlockTime);
    event Unlocked (uint id, address owner, address token, uint numOfTokens);

    modifier onlyMaster() {
        require(msg.sender == master, "Only master is allowed to call."); 
        _;
    }

    // modifier NotExpired() {
    //     require(block.timestamp < lockerInfo.unlockTime, "Not unlocked yet.");
    //     _;
    // }

    // modifier Expired() {
    //     require(block.timestamp >= lockerInfo.unlockTime, "The locker has been expired.");
    //     _;
    // }


    constructor (
        uint _lockerID, 
        address _owner, 
        IERC20 _token, 
        uint _numOfTokens, 
        uint _unlockTime
    ) 
    {
        master = msg.sender;
        lockerInfo = LockerInfo(_lockerID, _owner, _token, _numOfTokens, block.timestamp, _unlockTime );
    }


    function unlockTokens(uint _numOfTokens) public onlyMaster {
        lockerInfo.numOfTokens = lockerInfo.numOfTokens.sub(_numOfTokens);   
        lockerInfo.token.transfer(lockerInfo.owner, _numOfTokens);
    }

    function addTokenstoALocker(uint _numOfTokens) public onlyMaster {
        // require(_numOfTokens > 0, "Tokens should be more than zero");
        lockerInfo.numOfTokens = lockerInfo.numOfTokens.add(_numOfTokens);
    }

    function increaseLocktime(uint _additionTime) public onlyMaster {
        // require(_additionTime > 0, "Addition time should be more than zero");
        lockerInfo.unlockTime = lockerInfo.unlockTime.add(_additionTime);
    }


}