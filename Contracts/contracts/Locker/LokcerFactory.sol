// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/extensions/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Locker.sol";
import "./ILocker.sol";


contract LokcerFactory is Ownable {

    using SafeMath for uint;
    uint public lockerCount;    

    uint public lockerFee = 0.1 ether;
    uint public updateLokcerFee = 0.05 ether;

    address public launchpadAddress;

    mapping(uint => LockerInfo)  public lockerInfo;
    mapping(address => uint[])  private lockersListByTokenAddress;
    mapping(address => uint[])  private lockersListByUserAddress;

    enum Status {LOCKED, WITHDRAWED}
    enum Type {TOKEN, LPTOKEN}

    struct LockerInfo {
        uint id;
        Type _type;
        address owner; 
        IERC20 token;
        Locker locker;
        uint numOfTokens;
        uint lockTime;
        uint unlockTime;
        Status status;
    }

    event Locked (uint id, address owner, address token, uint numOfTokens, uint unlockTime);
    event Unlocked (uint id, address owner, address token, uint numOfTokens);

    modifier OnlyLockerOnwer(uint _id) {
        require(lockerInfo[_id].owner == _msgSender(), "Only locker onwer is allowed."); 
        _;
    }

    modifier NotExpired(uint _id) {
        require(lockerInfo[_id].id > 0, "Invalid ID.");
        require(block.timestamp < lockerInfo[_id].unlockTime, "The locker has been expired.");
        _;
    }

    modifier Expired(uint _id) {
        require(lockerInfo[_id].id > 0, "Invalid ID.");
        require(block.timestamp >= lockerInfo[_id].unlockTime, "Not unlocked yet.");
        _;
    }

    function createLcoker(Type _type, address _owner, IERC20 _token, uint _numOfTokens, uint _unlockTime) payable public returns(uint){

        bool isExcludedFromFee = msg.sender == owner() || msg.sender == launchpadAddress;

        if(!isExcludedFromFee){
            require(msg.value >= lockerFee, "Please pay the fee");
        }

        require(_unlockTime > 0, "The unlock time should in future");

        lockerCount++;

        Locker locker = new Locker(lockerCount, _owner, _token, _numOfTokens, _unlockTime);

        _token.transferFrom(_msgSender(), address(locker), _numOfTokens);

        lockerInfo[lockerCount] = LockerInfo(
            lockerCount,
            _type,
            _owner,
            _token,
            locker,
            _numOfTokens,
            block.timestamp,
            _unlockTime,
            Status.LOCKED
        );

        lockersListByUserAddress[_msgSender()].push(lockerCount);
        lockersListByTokenAddress[address(_token)].push(lockerCount);

        emit Locked (lockerCount, _msgSender(), address(_token), _numOfTokens, _unlockTime );

        return lockerCount;
        
    }
    
    function unlockTokens(uint _id, uint _numOfTokens) public Expired(_id) OnlyLockerOnwer(_id) {

        LockerInfo memory lockerData = lockerInfo[_id];
        require(lockerData.numOfTokens >= _numOfTokens, "Not enough tokens to withdraw");

        lockerData.locker.unlockTokens(_numOfTokens);

        lockerInfo[_id].numOfTokens = lockerData.numOfTokens.sub(_numOfTokens);   

        if(lockerInfo[_id].numOfTokens == 0 ){
            lockerInfo[_id].status = Status.WITHDRAWED;
        }

        emit Unlocked (_id, _msgSender(), address(lockerData.token), _numOfTokens);

    }

    function addTokenstoALocker(uint _id, uint _numOfTokens) public payable NotExpired(_id) OnlyLockerOnwer(_id) {

        require(msg.value >= updateLokcerFee, "Please pay the updating fee");
        require(_numOfTokens > 0, "Tokens should be more than zero");

        LockerInfo memory lockerData = lockerInfo[_id];

        lockerData.token.transferFrom(_msgSender(), address(lockerData.locker), _numOfTokens);

        lockerData.locker.addTokenstoALocker(_numOfTokens);

        lockerInfo[_id].numOfTokens = lockerData.numOfTokens.add(_numOfTokens);

    }

    function increaseLocktime(uint _id, uint _additionTime) public payable NotExpired(_id) OnlyLockerOnwer(_id) {

        require(msg.value >= updateLokcerFee, "please pay the updating fee");
        require(_additionTime > 0, "Addition time should be more than zero");

        LockerInfo memory lockerData = lockerInfo[_id];

        lockerData.locker.increaseLocktime(_additionTime);
        lockerInfo[_id].unlockTime = lockerData.unlockTime.add(_additionTime);

    }

    function getLockersListbyUser(address _userAddress) public view returns (uint[] memory) {
        return lockersListByUserAddress[_userAddress];
    }

    function getLockersListbyToken(address _tokenAddress) public view returns (uint[] memory) {
        return lockersListByTokenAddress[_tokenAddress];
    }

    function updateFees(uint _lockerFee, uint _updatingFee) public onlyOwner {
        lockerFee = _lockerFee;
        updateLokcerFee = _updatingFee;
    }

    function withdrawFunds() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        payable(owner()).transfer(balance);
    }

    function setLaunchPadAddress(address _launchpadAddress) public onlyOwner {
        launchpadAddress = _launchpadAddress;
    }

    receive() external payable {
            // emit ValueReceived(msg.sender, msg.value);
        }

}