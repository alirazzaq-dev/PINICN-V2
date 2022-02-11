// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

import "./LPLocker.sol";

contract LPLokcerManager is Ownable {

    using SafeMath for uint;
    uint public lockerCount;

    // uint public lockerFee = 0.1 ether;
    // uint public updateLokcerFee = 0.05 ether;

    address public launchpadAddress;

    mapping(uint => LockerInfo)  public lockerInfoByID;
    mapping(address => LockerInfo)  public lockerInfoByToken;
    mapping(address => uint[])  public lockersListByUser;
    // mapping()

    struct LockerInfo {
        uint id;
        address lockerAddress;
        address owner; 
        address token;
        uint numOfTokens;
        uint lockTime;
        uint unlockTime;
    }

    event LPLocked (uint id, address owner, address token, uint numOfTokens, uint unlockTime);

    function createLPLcoker(address _owner, address _token, uint _numOfTokens, uint _unlockTime) payable public returns(uint){
        
        // console.log("Trying to create a LP locker");

        require(_unlockTime > 0, "The unlock time should in future");

        lockerCount++;

        LPLocker locker = new LPLocker(lockerCount, _owner, _token, _numOfTokens, _unlockTime);

        IERC20(_token).transferFrom(msg.sender, address(locker), _numOfTokens);


        LockerInfo memory _lockerInfo = LockerInfo(
            lockerCount,
            address(locker),
            _owner, 
            _token,
            _numOfTokens,
            block.timestamp,
            _unlockTime
        );

        console.log("_token", _token);


        lockerInfoByID[lockerCount] = _lockerInfo;
        lockerInfoByToken[_token] = _lockerInfo;
        lockersListByUser[_owner].push(lockerCount);

        emit LPLocked (lockerCount, _owner, _token, _numOfTokens, _unlockTime );

        return lockerCount;
        
    }
    
    // function getLockersListbyUser(address _userAddress) public view returns (uint[] memory) {
    //     return lockersListByUserAddress[_userAddress];
    // }

    // function getLockersListbyToken(address _tokenAddress) public view returns (uint[] memory) {
    //     return lockersListByTokenAddress[_tokenAddress];
    // }

    // function updateFees(uint _lockerFee, uint _updatingFee) public onlyOwner {
    //     lockerFee = _lockerFee;
    //     updateLokcerFee = _updatingFee;
    // }

    // function withdrawFunds() public onlyOwner {
    //     uint balance = address(this).balance;
    //     require(balance > 0, "Nothing to withdraw");
    //     payable(owner()).transfer(balance);
    // }

    // function setLaunchPadAddress(address _launchpadAddress) public onlyOwner {
    //     launchpadAddress = _launchpadAddress;
    // }

    // receive() external payable {
    //         // emit ValueReceived(msg.sender, msg.value);
    // }

}