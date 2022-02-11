// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

import "./LaunchPadLib.sol";
import "./ILPLokcerManager.sol";

contract Presale is Ownable {

    using LaunchPadLib for *;
    using SafeMath for uint256;

    uint8 public salesFeeInPercent;
    LaunchPadLib.RefundType public refundType;
    LaunchPadLib.LaunchpadAddresses public launchpadAddresses;

    // Declare a set state variable    
    // address public teamAddr;
    // address public devAddr;
    // //# PancakeSwap on local network:
    // address public pancakeSwapFactoryAddr;
    // address public pancakeSwapRouterAddr;
    // address public WBNBAddr;
    // address public lpLockerManager;

    //# PancakeSwap on BSC mainnet
    // address pancakeSwapFactoryAddr = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    // address pancakeSwapRouterAddr = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    // address WBNBAddr = 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c;
      
    //# PancakeSwap on BSC testnet:
    // address public pancakeSwapFactoryAddr = 0x6725F303b657a9451d8BA641348b6761A6CC7a17;
    // address public pancakeSwapRouterAddr = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
    // address public WBNBAddr = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;  

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    LaunchPadLib.PresaleInfo public presaleInfo;
    LaunchPadLib.PresalectCounts public presaleCounts;
    LaunchPadLib.ParticipationCriteria public participationCriteria;
    LaunchPadLib.InternalData public internalData;
    LaunchPadLib.PreSaleStatus public preSaleStatus =  LaunchPadLib.PreSaleStatus.PENDING;

    mapping(address => LaunchPadLib.Participant) public participant;

    modifier isPresaleActive() {
        require (block.timestamp >= participationCriteria.presaleTimes.startedAt, "Presale hasn't begin yet. please wait");
        require( block.timestamp < participationCriteria.presaleTimes.expiredAt, "Presale is over. Try next time");
        if(preSaleStatus == LaunchPadLib.PreSaleStatus.PENDING){
            preSaleStatus = LaunchPadLib.PreSaleStatus.INPROGRESS;
        }
        require(preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");
        _;
    }

    modifier onlyPresaleOwner() {
        require(presaleInfo.presaleOwnerAddr == _msgSender(), "Ownable: caller is not the owner of this presale");
        _;
    }

    modifier isPresaleEnded(){
        require (
            preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED || 
            preSaleStatus == LaunchPadLib.PreSaleStatus.FAILED, 
            "Presale is not concluded yet"
        );
        _;
    }

    constructor (
        uint8 _salesFeeInPercent,
        LaunchPadLib.PresaleInfo memory _presaleInfo,
        LaunchPadLib.ParticipationCriteria memory _critera,
        LaunchPadLib.LaunchpadAddresses memory _launchpadAddresses
    ){
        transferOwnership(_presaleInfo.presaleOwnerAddr);
        salesFeeInPercent = _salesFeeInPercent;
        presaleInfo = _presaleInfo;
        participationCriteria = _critera;
        presaleCounts = LaunchPadLib.PresalectCounts( _presaleInfo.tokensForSale, 0, 0, 0 );
        launchpadAddresses = _launchpadAddresses;
    }


    function validateBuyRequest(uint256 _numOfTokensRequested) internal returns (bool){

        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];

        require(presaleCounts.remainingTokensForSale > 0 , "the sale is sold out");

        if(presaleInfo.typeOfPresale == LaunchPadLib.PresaleType.WHITELISTED){
            require( currentParticipant.isWhiteListed == true, "Only whitelisted users are allowed to participate");
        }
        
        if(presaleInfo.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS){
            require(IERC20(participationCriteria.criteriaToken).balanceOf(msg.sender) >= participationCriteria.minTokensForParticipation, "You don't hold enough criteria tokens");
        }
        
        if(currentParticipant.tokens == 0) {
            presaleCounts.contributors++;
            require(_numOfTokensRequested >= participationCriteria.reqestedTokens.minTokensReq, "Request for tokens is low, Please request more than minTokensReq");
        }

        require(_numOfTokensRequested + currentParticipant.tokens <= participationCriteria.reqestedTokens.maxTokensReq, "Request for tokens is high, Please request less than maxTokensReq");

        return true;

    }

    function buyTokensOnPresale(uint256 _numOfTokensRequested) public payable isPresaleActive {

        require(_numOfTokensRequested <= presaleCounts.remainingTokensForSale, "insufficient tokens to fulfill this order");
        require(msg.value >= _numOfTokensRequested*participationCriteria.price, "insufficient funds");

        require(validateBuyRequest(_numOfTokensRequested));

        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];

        presaleCounts.accumulatedBalance = presaleCounts.accumulatedBalance.add(msg.value);
        presaleCounts.remainingTokensForSale = presaleCounts.remainingTokensForSale.sub(_numOfTokensRequested);

        uint newValue = currentParticipant.value.add(msg.value);
        uint newTokens = currentParticipant.tokens.add(_numOfTokensRequested);

        participant[msg.sender].value = newValue;
        participant[msg.sender].tokens = newTokens;
        
    }

    function finalizePresale() public onlyPresaleOwner {
        
        require(preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");

        require (
            block.timestamp > participationCriteria.presaleTimes.expiredAt ||
            presaleCounts.remainingTokensForSale == 0,
            "Presale is not over yet"
        );
        
        uint256 totalTokensSold = presaleInfo.tokensForSale - presaleCounts.remainingTokensForSale;
        
        if( totalTokensSold >= participationCriteria.reqestedTokens.softCap ){
            
            uint256 tokensToAddLiquidity = totalTokensSold.mul(presaleInfo.reservedTokensPCForLP).div(100);
            
                uint256 poolShareBNB = distributeRevenue();
                // console.log("poolShareBNB", poolShareBNB);

                addLiquidity(tokensToAddLiquidity, poolShareBNB);
                lockLiquidity();

                // require(lockLiquidity(), "liquidity lock is unseccessful");

                internalData.totalTokensSold = totalTokensSold;
                internalData.tokensAddedToLiquidity = tokensToAddLiquidity;
                internalData.extraTokens = extraTokensOnSeccess();
                // console.log("extraTokensOnSeccess", extraTokensOnSeccess());
                
                preSaleStatus = LaunchPadLib.PreSaleStatus.SUCCEED;
           
        }
        else {

            // internalData.extraTokens = presaleInfo.tokensForSale +  presaleInfo.tokenForLocker + presaleInfo.tokensForSale.mul(presaleInfo.reservedTokensPCForLP).div(100);
            internalData.extraTokens = IERC20(presaleInfo.preSaleToken).balanceOf(address(this));
            preSaleStatus = LaunchPadLib.PreSaleStatus.FAILED;

        }
        
    }

    function extraTokensOnSeccess() internal view returns (uint) {
        uint remainingTokensFromLP = presaleCounts.remainingTokensForSale.mul(presaleInfo.reservedTokensPCForLP).div(100);
        return presaleCounts.remainingTokensForSale + remainingTokensFromLP;
    }

    function addLiquidity(uint tokensToAddLiquidity, uint poolShareBNB) internal {
        require(IERC20(presaleInfo.preSaleToken).approve(launchpadAddresses.pancakeSwapRouterAddr, tokensToAddLiquidity), "unable to approve token tranfer to pancakeSwapRouterAddr");

        IUniswapV2Router02(launchpadAddresses.pancakeSwapRouterAddr).addLiquidityETH{value : poolShareBNB}(
            address(presaleInfo.preSaleToken),
            tokensToAddLiquidity,
            0,
            0,
            address(this),
            block.timestamp + 60
        );
    }

    function lockLiquidity() internal {
        
        // uint _lpLockupTime = participationCriteria.presaleTimes.lpLockupTime;
        address pairAddress = IUniswapV2Factory(launchpadAddresses.pancakeSwapFactoryAddr).getPair(presaleInfo.preSaleToken, launchpadAddresses.WBNBAddr);
        uint totalLPs = IERC20(pairAddress).balanceOf(address(this)); 
        internalData.totalLPLocked = totalLPs;
       
    }

    function distributeRevenue() internal returns (uint256) {

        LaunchPadLib.PresaleInfo memory info = presaleInfo;

        uint256 revenueFromPresale = presaleCounts.accumulatedBalance;

        uint256 poolShareBNB = revenueFromPresale.mul(info.reservedTokensPCForLP).div(100);
        uint256 devTeamShareBNB = revenueFromPresale.mul(salesFeeInPercent).div(100);
        uint256 ownersShareBNB = revenueFromPresale.sub(poolShareBNB.add(devTeamShareBNB));

        internalData.revenueFromPresale = revenueFromPresale;
        internalData.poolShareBNB = poolShareBNB;
        internalData.devTeamShareBNB = devTeamShareBNB;
        internalData.ownersShareBNB = ownersShareBNB;

        require(payable(info.presaleOwnerAddr).send(ownersShareBNB), "cannot send owner's share");
        // payable(info.presaleOwnerAddr).transfer(ownersShareBNB);

        uint devShare = devTeamShareBNB.mul(75).div(100);
        require(payable(launchpadAddresses.devAddr).send(devShare), "cannot send dev's share"); 
        // payable(devAddr).transfer(devShare);

        uint teamShare = devTeamShareBNB.sub(devShare);
        require(payable(launchpadAddresses.teamAddr).send(teamShare), "cannot send devTeam's share");
        // payable(teamAddr).transfer(teamShare);        

        return  poolShareBNB;


    }

    function claimTokensOrARefund() public isPresaleEnded {
        
        LaunchPadLib.Participant memory _participant = participant[msg.sender];

        require(_participant.value > 0, "Nothing to claim");

        IERC20 tokenAddress = IERC20(presaleInfo.preSaleToken);

        participant[msg.sender].value = 0;
        participant[msg.sender].tokens = 0;

        presaleCounts.claimsCount++;

        // require(preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED || preSaleStatus == LaunchPadLib.PreSaleStatus.FAILED, "Presale is not concluded yet");

        uint avaialbelBalance = tokenAddress.balanceOf(address(this));
        
        if (preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED){
            require(_participant.tokens > 0, "No tokens to claim");
            require(avaialbelBalance >= _participant.tokens , "Not enough tokens are available");
            bool tokenDistribution = tokenAddress.transfer(msg.sender, _participant.tokens);
            require(tokenDistribution, "Unable to transfer tokens to the participant");
        }
        else {
            require(_participant.value > 0, "No amount to refund");
            bool refund = payable(msg.sender).send(_participant.value);
            require(refund, "Unable to refund amount to the participant");
        }

    }

    function withdrawExtraTokens() public onlyPresaleOwner  isPresaleEnded {

        uint tokensToReturn = internalData.extraTokens;
        
        require(tokensToReturn > 0, "No tokens to withdraw");

        internalData.extraTokens = 0;

        LaunchPadLib.PresaleInfo memory info = presaleInfo;

        if(participationCriteria.refundType == LaunchPadLib.RefundType.WITHDRAW ){
            bool tokenDistribution = IERC20(info.preSaleToken).transfer(msg.sender, tokensToReturn);
            assert( tokenDistribution);
        }
        else{
            bool tokenDistribution = IERC20(info.preSaleToken).transfer(0x000000000000000000000000000000000000dEaD , tokensToReturn);
            assert( tokenDistribution );
        }
    }

    function chageSaleType(LaunchPadLib.PresaleType _type, address _address, uint minimumTokens) public onlyPresaleOwner {
        if(_type == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            presaleInfo.typeOfPresale = _type;
            participationCriteria.criteriaToken = _address;
            participationCriteria.minTokensForParticipation = minimumTokens;
        }
        else {
            presaleInfo.typeOfPresale = _type;
        }
    }

    function unlockTokens() public onlyPresaleOwner isPresaleEnded{

        require(block.timestamp >= participationCriteria.presaleTimes.tokenLockupTime, "Not allowed");

        require(
            IERC20(presaleInfo.preSaleToken).transfer(msg.sender, presaleInfo.tokenForLocker),
             "Unable to transfer presale tokens to the presale owner"
            );

    }

    function unlockLPTokens() public onlyPresaleOwner isPresaleEnded {

        require(block.timestamp >= participationCriteria.presaleTimes.lpLockupTime, "Not allowed");

        address pairAddress = IUniswapV2Factory(launchpadAddresses.pancakeSwapFactoryAddr).getPair(presaleInfo.preSaleToken, launchpadAddresses.WBNBAddr);

        require(
            IERC20(pairAddress).transfer(presaleInfo.presaleOwnerAddr, internalData.totalLPLocked),
            "Unable to transfer presale tokens to the presale owner"
        );

    }

    function whiteListUsers(address[] memory _addresses) public onlyPresaleOwner {
        for(uint i=0; i < _addresses.length; i++){
            participant[_addresses[i]].isWhiteListed = true;
        }
    }

}