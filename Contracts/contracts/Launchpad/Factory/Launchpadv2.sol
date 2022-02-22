// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Presale.sol";
import "./LaunchPadLib.sol";

import "hardhat/console.sol";

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
        LaunchPadLib.TokenInfo memory _tokenInfo,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        // LaunchPadLib.Tokenomics memory _tokenomics,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.TeamVesting memory _teamVesting
        ) internal view {
        

        require( address(_tokenInfo.preSaleToken) != address(0), "Presale project address can't be null");
                
        if(_presaleType == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( _participationCriteria.criteriaToken != address(0), "Criteria token address can't be null");
        }

        if(_teamVesting.isEnabled){
            require(_teamVesting.vestingTokens > 0, "Vesting tokens should be more than zero");
        }

        require( _participationCriteria.tokensPCForLP >= 50 && _participationCriteria.tokensPCForLP <= 95, "liquidity should be at least 50% or more");
        
        require( _participationCriteria.tokensForSale > 0, "tokens for sale must be more than 0");

        require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
        require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
        require( _reqestedTokens.softCap >= _participationCriteria.tokensForSale.div(2), "softcap should be at least 50% or more");

        require ( _presaleTimes.startedAt > block.timestamp, "startedAt should be more than 15 minutes from now" );
        require ( _presaleTimes.expiredAt > block.timestamp, "expiredAt should be more than one day from now" );
        require ( _presaleTimes.lpLockupDuration > 0, "Lockup period should be  7 or more days from now time" );

        require ( _participationCriteria.priceOfEachToken > 0, "_priceOfEachToken should be more than zero" );

    }

    function createPresale(
        LaunchPadLib.TokenInfo memory _tokenInfo,
        // LaunchPadLib.Tokenomics memory _tokenomics,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting

        ) public payable {

            validateCreateInput(
                _participationCriteria.typeOfPresale, 
                _tokenInfo, 
                _participationCriteria, 
                // _tokenomics,
                _presaleTimes,
                _reqestedTokens,
                _teamVesting
                );

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
                launchpadAddresses,
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

       
        presaleRecordByToken[_tokenInfo.preSaleToken] = address(_presale);
        presaleRecordByID[presaleCount] = address(_presale);


    }

    function transferTokens(address _preSaleToken, address _presaleContract, uint _tokensForSale, uint _reservedTokensPCForLP, uint _vestingTokens, uint _decimal) internal {
        
        uint tokensForSale = _tokensForSale.mul(10**_decimal);
        uint tokensForLP = tokensForSale.mul(_reservedTokensPCForLP).div(100);
        uint tokensForVesting = _vestingTokens.mul(10**_decimal);

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

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function withdrawBNBs() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 , "nothing to withdraw");

        uint teamShare = balance.mul(70).div(100);
        uint devShare = balance.sub(teamShare);
        
        // payable(launchpadAddresses.teamAddr).transfer(teamShare);
        // payable(launchpadAddresses.devAddr).transfer(devShare);

        (bool res1,) = payable(launchpadAddresses.teamAddr).call{value: teamShare}("");
        require(res1, "cannot send team Share"); 


        (bool res2,) = payable(launchpadAddresses.devAddr).call{value: devShare}("");
        require(res2, "cannot send devTeamShare"); 


    }

    receive() external payable {
        // console.log("Money recieved: ", msg.value);
    }

}
