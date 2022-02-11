// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Presale.sol";
import "./LaunchPadLib.sol";

contract Launchpadv2 is Ownable {
    
    using LaunchPadLib for *;
    using SafeMath for uint256;

    uint public presaleCount = 0;
    uint public upfrontfee = 0.2 ether;
    uint8 public salesFeeInPercent = 2;

    // Declare a set state variable    
    address public teamAddr;
    address public devAddr;
    
    LaunchPadLib.LaunchpadAddresses public launchpadAddresses;

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint => address) public presaleRecordByID;
    mapping(address => address) public presaleRecordByToken;
    mapping(address => bool) public isUserWhitelistedToStartProject;


    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    constructor( LaunchPadLib.LaunchpadAddresses memory _launchpadAddresses ){
        launchpadAddresses = _launchpadAddresses;
    }

    function validateCreateInput(
        LaunchPadLib.PresaleType _presaleType,
        address _preSaleToken,
        address _criteriaTokenAddr,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForSale,
        uint256 _priceOfEachToken,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens
        ) internal view returns(bool) {
        
        require( address(_preSaleToken) != address(0), "Presale project address can't be null");
                
        if(_presaleType == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( address(_criteriaTokenAddr) != address(0), "Criteria token address can't be null");
        }

        require( _reservedTokensPCForLP >= 50 && _reservedTokensPCForLP <= 100, "liquidity should be at least 50% or more");
        
        require( _tokensForSale > 0, "tokens for sale must be more than 0");

        require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
        require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
        require( _reqestedTokens.softCap >= _tokensForSale.div(2), "softcap should be at least 50% or more");

        require ( _presaleTimes.startedAt >= block.timestamp + 15 minutes, "startedAt should be more than 15 minutes from now" );
        require ( _presaleTimes.expiredAt >= block.timestamp + 1 days, "expiredAt should be more than one day from now" );
        require ( _presaleTimes.lpLockupTime >= block.timestamp + 7 days, "Lockup period should be  7 or more days from now time" );

        require ( _priceOfEachToken > 0, "_priceOfEachToken should be more than zero" );

        return true;
    }

    function createPresale(
        LaunchPadLib.PresaleType _presaleType,
        address _preSaleToken,
        uint256 _tokensForSale,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForLocker,
        address _criteriaTokenAddr,
        uint256 _priceOfEachToken,
        uint256 _minTokensForParticipation,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.RefundType _refundType
        ) public payable {

        require(
            validateCreateInput(
                _presaleType, 
                _preSaleToken, 
                _criteriaTokenAddr, 
                _reservedTokensPCForLP, 
                _tokensForSale, 
                _priceOfEachToken,
                _presaleTimes,
                _reqestedTokens
                )
        );

        if(!(isUserWhitelistedToStartProject[msg.sender] || msg.sender == owner())) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }

        presaleCount++;
                
        LaunchPadLib.PresaleInfo memory _presaleInfo = LaunchPadLib.PresaleInfo(
            presaleCount,
            _presaleType,
            _preSaleToken,
            msg.sender,
            _tokensForSale,
            _reservedTokensPCForLP,
            _tokensForLocker
        );

        LaunchPadLib.ParticipationCriteria memory _criteria = LaunchPadLib.ParticipationCriteria(
            _criteriaTokenAddr,
            _priceOfEachToken,
            _refundType,
            _minTokensForParticipation,
            _reqestedTokens,
            _presaleTimes
        );

        Presale _presale = new Presale ( salesFeeInPercent, _presaleInfo, _criteria, launchpadAddresses );

        require(transferTokens(_preSaleToken, address(_presale), _tokensForSale, _reservedTokensPCForLP, _tokensForLocker));
        
        presaleRecordByToken[_preSaleToken] = address(_presale);
        presaleRecordByID[presaleCount] = address(_presale);


    }

    function transferTokens(address _preSaleToken, address _presale, uint _tokensForSale, uint _reservedTokensPCForLP, uint _tokensForLocker) internal returns(bool){
        uint tokensForLP = _tokensForSale.mul(_reservedTokensPCForLP).div(100);

        require(
            IERC20(_preSaleToken).transferFrom(msg.sender, _presale, _tokensForSale.add(tokensForLP).add(_tokensForLocker)),
             "Unable to transfer presale tokens to the contract"
            );

        return true;
    }

    function whiteListUsersToStartProject(address[] memory _addresses) public onlyOwner {
        for(uint i=0; i < _addresses.length; i++){
            isUserWhitelistedToStartProject[_addresses[i]] = true;
        }
    }

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function withdrawBNBs() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 , "nothing to withdraw");
        payable(owner()).transfer(balance);
        // require(transfer, "cannot send devTeam's share");

    }

    receive() external payable {
            // emit ValueReceived(msg.sender, msg.value);
    }

}
