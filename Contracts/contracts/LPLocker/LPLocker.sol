// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract LPLocker is Context {
    
    using SafeMath for uint;

    // address private master;
    LockerInfo internal lockerInfo;

    enum Status {LOCKED, WITHDRAWED}

    struct LockerInfo {
        uint id;
        address owner; 
        address token;
        uint numOfTokens;
        uint lockTime;
        uint unlockTime;
        Status status;
    }

    constructor (
        uint _lockerID, 
        address _owner, 
        address _token, 
        uint _numOfTokens, 
        uint _unlockTime
    ) 
    {
        lockerInfo = LockerInfo(_lockerID, _owner, _token, _numOfTokens, block.timestamp, _unlockTime, Status.LOCKED );
    }

        function unlockTokens() public {

        require(lockerInfo.owner == _msgSender(), "Only locker onwer is allowed."); 
        require(lockerInfo.owner == _msgSender(), "Only locker onwer is allowed."); 


        IERC20(lockerInfo.token).transfer(lockerInfo.owner, lockerInfo.numOfTokens);
        lockerInfo.status = Status.WITHDRAWED;

    }

    // function addTokenstoALocker(uint _numOfTokens) public payable NotExpired OnlyLockerOnwer {

    //     require(msg.value >= updateLokcerFee, "Please pay the updating fee");
    //     require(_numOfTokens > 0, "Tokens should be more than zero");

    //     lockerInfo.token.transferFrom(_msgSender(), address(this), _numOfTokens);
    //     lockerInfo.numOfTokens = lockerInfo.numOfTokens.add(_numOfTokens);

    // }

    // function increaseLocktime(uint _additionTime) public payable NotExpired OnlyLockerOnwer {

    //     require(msg.value >= updateLokcerFee, "Please pay the updating fee");
    //     require(_additionTime > 0, "Addition time should be more than zero");

    //     lockerInfo.unlockTime = lockerInfo.unlockTime.add(_additionTime);

    // }


}