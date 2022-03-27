// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./Presale.sol";
import "./LaunchPadLib.sol";

// import "hardhat/console.sol";

contract Launchpadv2 is Ownable {
    
    using LaunchPadLib for *;

    uint public presaleCount = 0;
    uint public upfrontfee = 0.2 ether;
    uint8 public salesFeeInPercent = 2;

    // Declare a set state variable    
    address public uniswapV2Router02;
    
    address public teamAddr;
    address public devAddr;

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint => address) public presaleRecordByID;
    mapping(address => address[]) private presaleRecordByToken;
    mapping(address => bool) public isUserWhitelistedToStartProject;

    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    constructor( address _IUniswapV2Router02, address _teamAddr, address _devAddr ){

        // 0xD99D1c33F9fC3444f8101754aBC46c52416550D1    BSC Testnet router
        // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D    Ropston testnet
        // launchpadAddresses = LaunchPadLib.LaunchpadAddresses (_IUniswapV2Router02);
        uniswapV2Router02 = _IUniswapV2Router02;
        teamAddr = _teamAddr;
        devAddr = _devAddr;

    }



    // function validateCreateInput(
    //     LaunchPadLib.PresaleType _presaleType,
    //     LaunchPadLib.TokenInfo memory _tokenInfo,
    //     LaunchPadLib.ParticipationCriteria memory _participationCriteria,
    //     // LaunchPadLib.Tokenomics memory _tokenomics,
    //     LaunchPadLib.PresaleTimes memory _presaleTimes,
    //     LaunchPadLib.ReqestedTokens memory _reqestedTokens,
    //     LaunchPadLib.TeamVesting memory _teamVesting
    //     ) internal view {
        

    //     require( address(_tokenInfo.preSaleToken) != address(0), "Presale project address can't be null");
                
    //     if(_presaleType == LaunchPadLib.PresaleType.TOKENHOLDERS) {
    //         require( _participationCriteria.criteriaToken != address(0), "Criteria token address can't be null");
    //     }

    //     if(_teamVesting.isEnabled){
    //         require(_teamVesting.vestingTokens > 0, "Vesting tokens should be more than zero");
    //     }

    //     require( _participationCriteria.tokensPCForLP >= 50 && _participationCriteria.tokensPCForLP <= 95, "liquidity should be at least 50% or more");
        
    //     require( _participationCriteria.tokensForSale > 0, "tokens for sale must be more than 0");

    //     require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
    //     require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
    //     require( _reqestedTokens.softCap >= _participationCriteria.tokensForSale.div(2), "softcap should be at least 50% or more");

    //     require ( _presaleTimes.startedAt > block.timestamp, "startedAt should be more than 15 minutes from now" );
    //     require ( _presaleTimes.expiredAt > block.timestamp, "expiredAt should be more than one day from now" );
    //     require ( _presaleTimes.lpLockupDuration > 0, "Lockup period should be  7 or more days from now time" );

    //     require ( _participationCriteria.priceOfEachToken > 0, "_priceOfEachToken should be more than zero" );

    // }

    function createPresale(
        LaunchPadLib.TokenInfo memory _tokenInfo,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting

        ) public payable {

            // validateCreateInput(
            //     _participationCriteria.typeOfPresale, 
            //     _tokenInfo, 
            //     _participationCriteria, 
            //     _presaleTimes,
            //     _reqestedTokens,
            //     _teamVesting
            //     );


        require( address(_tokenInfo.preSaleToken) != address(0), "Presale project address can't be null");
                    
        if(_participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( _participationCriteria.criteriaToken != address(0), "Criteria token address can't be null");
        }

        if(_teamVesting.isEnabled){
            require(_teamVesting.vestingTokens > 0, "Vesting tokens should be more than zero");
        }

        require( _participationCriteria.tokensPCForLP >= 50 && _participationCriteria.tokensPCForLP <= 95, "liquidity should be at least 50% or more");

        require( _participationCriteria.tokensForSale > 0, "tokens for sale must be more than 0");

        require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
        require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
        require( _reqestedTokens.softCap >= (_participationCriteria.tokensForSale / 2), "softcap should be at least 50% or more");

        require ( _presaleTimes.startedAt > block.timestamp, "startedAt should be more than 15 minutes from now" );
        require ( _presaleTimes.expiredAt > block.timestamp, "expiredAt should be more than one day from now" );
        require ( _presaleTimes.lpLockupDuration > 0, "Lockup period should be  7 or more days from now time" );

        require ( _participationCriteria.priceOfEachToken > 0, "_priceOfEachToken should be more than zero" );


        bool exemtFromFee = isUserWhitelistedToStartProject[msg.sender] || msg.sender == owner();

        if(!exemtFromFee) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }

        presaleCount++;
        
        LaunchPadLib.PresaleInfo memory _presaleInfo = LaunchPadLib.PresaleInfo(
            presaleCount,
            msg.sender,
            LaunchPadLib.PreSaleStatus.PENDING
        );

        Presale _presale = new Presale ( 
                salesFeeInPercent,
                _presaleInfo,
                _tokenInfo,
                _participationCriteria,
                _presaleTimes,
                _reqestedTokens,
                uniswapV2Router02,
                _contributorsVesting,
                _teamVesting
         );



        transferTokens(
            _tokenInfo.preSaleToken, 
            address(_presale), 
            _participationCriteria.tokensForSale, 
            _participationCriteria.tokensPCForLP, 
            _teamVesting.vestingTokens,
            _tokenInfo.decimals
            );


        // uint tokensForSale = _participationCriteria.tokensForSale * 10**_tokenInfo.decimals;
        // uint tokensForLP = (_participationCriteria.tokensForSale * _participationCriteria.tokensPCForLP) / 100;
        // uint tokensForVesting = _teamVesting.vestingTokens * 10**_tokenInfo.decimals;

        // uint totalTokens = tokensForSale + tokensForLP + tokensForVesting;

        // // console.log("Trying to transfer tokens: ", totalTokens.mul(10**_decimal));
        // require(
        //     IERC20(_tokenInfo.preSaleToken).transferFrom(msg.sender, address(_presale), totalTokens),
        //      "Unable to transfer presale tokens to the contract"
        //     );


       
        presaleRecordByToken[_tokenInfo.preSaleToken].push(address(_presale));
        presaleRecordByID[presaleCount] = address(_presale);

    }

    function transferTokens(address _preSaleToken, address _presaleContract, uint _tokensForSale, uint _reservedTokensPCForLP, uint _vestingTokens, uint _decimal) internal {
        
        uint tokensForSale = _tokensForSale * 10**_decimal;
        uint tokensForLP = (tokensForSale * _reservedTokensPCForLP) / 100;
        uint tokensForVesting = _vestingTokens * 10**_decimal;

        uint totalTokens = tokensForSale + tokensForLP + tokensForVesting;

        // console.log("Trying to transfer tokens: ", totalTokens.mul(10**_decimal));
        require(
            IERC20(_preSaleToken).transferFrom(msg.sender, _presaleContract, totalTokens),
             "Unable to transfer presale tokens to the contract"
            );
    }

    function whiteListUsersToStartProject(address[] memory _addresses) public onlyOwner {
        for(uint i=0; i < _addresses.length; i++){
            isUserWhitelistedToStartProject[_addresses[i]] = true;
        }
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
        uint devShare = balance - teamShare;
        

        (bool res1,) = payable(teamAddr).call{value: teamShare}("");
        require(res1, "cannot send team Share"); 


        (bool res2,) = payable(devAddr).call{value: devShare}("");
        require(res2, "cannot send devTeamShare"); 


    }

    receive() external payable {
        // console.log("Money recieved: ", msg.value);
    }

}
