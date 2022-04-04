// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;


import "./Presale.sol";
import "./LaunchPadLib.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Launchpadv2 is Ownable {
    
    using LaunchPadLib for *;

    uint public presaleCount = 0;
    uint public upfrontfee = 0.0002 ether;
    uint8 public salesFeeInPercent = 2;

    // address public uniswapV2Router02 = 0x10ED43C718714eb63d5aA57B78B54704E256024E;    // BSC Mainnet router
    address public uniswapV2Router02 = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;    // BSC Testnet router

    address public teamAddr = 0xE813d775f33a97BDA25D71240525C724423D4Cd0;
    address public devAddr = 0xE813d775f33a97BDA25D71240525C724423D4Cd0;

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint => address) public presaleRecordByID;
    mapping(address => address[]) private presaleRecordByToken;

    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    constructor( address _uniswapV2Router02, address _teamAddr, address _devAddr ){

        uniswapV2Router02 = _uniswapV2Router02;
        teamAddr = _teamAddr;
        devAddr = _devAddr;

    }


    function createPresale(
        LaunchPadLib.PresaleInfo memory _presaleInfo,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting,
        LaunchPadLib.GeneralInfo memory _generalInfo
        ) public payable {

        // require( address(_presaleInfo.preSaleToken) != address(0), "Presale project address can't be null");
                    
        if(_participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( _participationCriteria.criteriaToken != address(0), "Criteria token address can't be null");
        }

        if(_teamVesting.isEnabled){
            require(_teamVesting.vestingTokens > 0, "Vesting tokens should be more than zero");
        }

        require( _participationCriteria.tokensPCForLP >= 50 && _participationCriteria.tokensPCForLP <= 95, "liquidity should be at least 50% or more");


        require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
        require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
        require( _reqestedTokens.softCap >= (_participationCriteria.tokensForSale / 2), "softcap should be at least 50% or more");

        require ( _presaleTimes.startedAt > block.timestamp, "startedAt should be more than from now" );
        require ( _presaleTimes.expiredAt > _presaleTimes.startedAt, "expiredAt should be more than one day from now" );
        require ( _presaleTimes.lpLockupDuration > 0, "Lockup period should be  7 or more days from now time" );

        require ( 
            _participationCriteria.priceOfEachToken > 0 &&
            _participationCriteria.tokensForSale > 0
            , "Price and Tokens for sale shoule be more than zero" );

        if(msg.sender != owner()) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }

        presaleCount++;
        
        _presaleInfo.id = presaleCount;
        _presaleInfo.presaleOwner = msg.sender;
        _presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.PENDING;

        Presale _presale = new Presale ( 
                salesFeeInPercent,
                _presaleInfo,
                _participationCriteria,
                _presaleTimes,
                _reqestedTokens,
                uniswapV2Router02,
                _contributorsVesting,
                _teamVesting,
                _generalInfo
        );


        uint tokensForSale = _participationCriteria.tokensForSale * 10**_presaleInfo.decimals;
        uint tokensForLP = (tokensForSale * _participationCriteria.tokensPCForLP) / 100;
        uint tokensForVesting = _teamVesting.vestingTokens * 10**_presaleInfo.decimals;

        uint totalTokens = tokensForSale + tokensForLP + tokensForVesting;

        require(
            IERC20(_presaleInfo.preSaleToken).transferFrom(msg.sender, address(_presale), totalTokens),
             "Unable to transfer presale tokens to the contract"
            );
                   
        presaleRecordByToken[_presaleInfo.preSaleToken].push(address(_presale));
        presaleRecordByID[presaleCount] = address(_presale);

    }

    function getPresaleRecordsByToken(address _address) public view returns(address[] memory) {
        return presaleRecordByToken[_address];
    }

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function withdrawBNBs() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 , "nothing to withdraw");

        uint teamShare = (balance * 70) / 100;       

        (bool res1,) = payable(teamAddr).call{value: teamShare}("");
        require(res1, "cannot send team Share"); 


        (bool res2,) = payable(devAddr).call{value: balance - teamShare}("");
        require(res2, "cannot send devTeamShare"); 


    }
    
    function updateTeamAddress(address _address) public onlyOwner {
        teamAddr = _address;
    }

    function updateDevAddress(address _address) public {
        require(msg.sender == devAddr, "Only dev is allowed");
        devAddr = _address;
    }

    receive() external payable {}

}
