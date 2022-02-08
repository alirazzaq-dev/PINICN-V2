//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./Presale.sol";
import "./LaunchPadLib.sol";


contract Launchpadv2 is Ownable, ReentrancyGuard {
    
    using LaunchPadLib for *;
    using SafeMath for uint256;

    uint public count = 0;
    uint public upfrontfee = 0.2 ether;
    uint8 public salesFeeInPercent = 2;

    // Declare a set state variable    
    address public teamAddr;
    address public devAddr;
    
  

    //# PancakeSwap on local network:
    address public pancakeSwapFactoryAddr;
    address public pancakeSwapRouterAddr;
    address public WBNBAddr;
    address public lockerFactoryAddr;

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint => address) public presaleRecord;

    mapping(address => bool) public isUserWhitelistedToStartProject;
    // mapping(uint256 => mapping(address => Participant)) public participant;


    ////////////////////////////// MODIFIRES //////////////////////////////

    // modifier isIDValid(uint _id) {
    //     require (address(presaleInfo[_id].preSaleToken) != address(0), "Not a valid ID");
    //     _;
    // }


    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    constructor(
        address _pancakeSwapFactoryAddr, 
        address _pancakeSwapRouterAddr, 
        address _WBNBAddr,
        address  _teamAddr,
        address _devAddr
        ){

        pancakeSwapFactoryAddr = _pancakeSwapFactoryAddr;
        pancakeSwapRouterAddr = _pancakeSwapRouterAddr; 
        WBNBAddr = _WBNBAddr;

        teamAddr = _teamAddr;
        devAddr = _devAddr;

    }

    function whiteListUsersToStartProject(address _address) public onlyOwner {
        isUserWhitelistedToStartProject[_address] = true;
    }

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function validateCreateInput(
        LaunchPadLib.PresaleType _presaleType,
        IERC20 _preSaleToken,
        IERC20 _criteriaTokenAddr,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForSale,
        uint256 _priceOfEachToken,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens
        ) internal view {
        
        require( address(_preSaleToken) != address(0), "Presale project address can't be null");
                
        if(_presaleType == LaunchPadLib.PresaleType.onlyTokenHolders) {
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

    }

    function createPresale(
        // Contract Info
        LaunchPadLib.PresaleType _presaleType,
        IERC20 _preSaleToken,
        IERC20 _criteriaTokenAddr,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForSale,

        // Participation Criteria
        uint256 _priceOfEachToken,
        uint256 _minTokensForParticipation,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens
        ) public payable returns(uint){

        bool needToPay = isUserWhitelistedToStartProject[msg.sender] || msg.sender == owner();

        if(!needToPay) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }

        validateCreateInput(
            _presaleType, 
            _preSaleToken, 
            _criteriaTokenAddr, 
            _reservedTokensPCForLP, 
            _tokensForSale, 
            _priceOfEachToken,
            _presaleTimes,
            _reqestedTokens
            );


        
        uint reservedTokens = _tokensForSale.mul(_reservedTokensPCForLP).div(100);

        require(
            _preSaleToken.transferFrom(msg.sender, address(this), _tokensForSale.add(reservedTokens)),
             "Unable to transfer presale tokens to the contract"
            );

        count++;
        
        Presale _presale = new Presale (
            count,
            msg.sender,
            _presaleType,
            _preSaleToken,
            _criteriaTokenAddr,
            _reservedTokensPCForLP,
            _tokensForSale,
            _priceOfEachToken, 
            _minTokensForParticipation, 
            _presaleTimes, 
            _reqestedTokens
        );

        presaleRecord[count] = address(_presale);
        return count;
    }

    function withdrawBNBs() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 , "nothing to withdraw");
        bool transfer = payable(teamAddr).send(balance);
        require(transfer, "cannot send devTeam's share");

    }

    receive() external payable {
            // emit ValueReceived(msg.sender, msg.value);
    }


    // function updatePresaleTime(uint _id, uint _starttime, uint _endTime) public onlyPresaleOwner(_id) isIDValid(_id){
        
    //     require(presaleInfo[_id].preSaleStatus == PreSaleStatus.pending, "Presale is in progress, you can't change criteria now");

    //     presaleParticipationCriteria[_id].presaleTimes.startedAt = _starttime;
    //     presaleParticipationCriteria[_id].presaleTimes.expiredAt = _endTime;
    // }

    // function updateParticipationCriteria (
    //         uint _id, uint _priceOfEachToken, uint _minTokensReq, uint _maxTokensReq, uint _softCap
    //     ) public onlyPresaleOwner(_id) isIDValid(_id) {

    //     require(presaleInfo[_id].preSaleStatus == PreSaleStatus.pending, "Presale is in progress, you can't change criteria now");
    //     require( _softCap >= presaleInfo[_id].tokensForSale.div(2), "softcap should be at least 50% of the total tokens offered on sale");
        
    //     presaleInfo[_id].priceOfEachToken = _priceOfEachToken;
    //     presaleParticipationCriteria[_id].reqestedTokens.minTokensReq = _minTokensReq;
    //     presaleParticipationCriteria[_id].reqestedTokens.maxTokensReq = _maxTokensReq;
    //     presaleParticipationCriteria[_id].softCap = _softCap;
    // }

    // function updateteamAddr(address _teamAddr) public onlyOwner {
    //     teamAddr = _teamAddr;
    // }

}

    // function updateTokensForSale( uint _id, uint _tokensForSale, uint _reservedTokensPCForLP ) public onlyPresaleOwner(_id) isIDValid(_id) {
    //     presaleInfo[_id].tokensForSale = _tokensForSale;
    //     presaleInfo[_id].remainingTokensForSale = _tokensForSale;
    //     presaleInfo[_id].reservedTokensPCForLP = _reservedTokensPCForLP;
    // }

    // function setCriteriaToken(
    //     uint _id, 
    //     address _criteriaToken, 
    //     uint _minTokensForParticipation
    // ) public onlyPresaleOwner(_id) {
    //     presaleParticipationCriteria[_id].minTokensForParticipation = _minTokensForParticipation;
    //     presaleParticipationCriteria[_id].criteriaTokenAddr = _criteriaToken;
    // }


    // function pausePresale(uint _id) public onlyPresaleOwner(_id) isIDValid(_id) {
    //     presaleInfo[_id].preSaleStatus = PreSaleStatus.paused;
    // }
    
    // function unpausePresale(uint _id) public onlyPresaleOwner(_id) isIDValid(_id) {
    //     presaleInfo[_id].preSaleStatus = PreSaleStatus.inProgress;
    // }