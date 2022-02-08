//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./LaunchPadLib.sol";
import "./ILPLokcerManager.sol";

contract Presale is Ownable {

    using LaunchPadLib for *;
    using SafeMath for uint256;


    uint public upfrontfee = 0.2 ether;
    uint8 public salesFeeInPercent = 2;


    // Declare a set state variable    
    address public teamAddr;
    address public devAddr;
      

    //# PancakeSwap on local network:
    address public pancakeSwapFactoryAddr;
    address public pancakeSwapRouterAddr;
    address public WBNBAddr;

    address public LPLockerManager;




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
    LaunchPadLib.PresalectCounts public presalectCounts;
    LaunchPadLib.PresaleParticipationCriteria public presaleParticipationCriteria;
    LaunchPadLib.InternalData public internalData;

    mapping(address => LaunchPadLib.Participant) public participant;


    modifier isPresaleActive() {
        require (block.timestamp >= presaleParticipationCriteria.presaleTimes.startedAt, "Presale hasn't begin yet. please wait");
        require( block.timestamp < presaleParticipationCriteria.presaleTimes.expiredAt, "Presale is over. Try next time");
        if(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.pending){
            presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.inProgress;
        }
        require(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.inProgress, "Presale is not in progress");
        _;
    }

    modifier onlyPresaleOwner() {
        require(presaleInfo.presaleOwnerAddr == _msgSender(), "Ownable: caller is not the owner of this presale");
        _;
    }

    constructor (
        uint _presaleID,
        address _owner,
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
    ){

        presaleInfo = LaunchPadLib.PresaleInfo(
            _presaleID,
            _presaleType,
            _preSaleToken,
            _owner,

            _priceOfEachToken,
            _tokensForSale,                     // 1000    tokensForSale
            _reservedTokensPCForLP,
            _tokensForSale,                     // remainingTokensForSale = tokensForSale (initially)
            0,
            LaunchPadLib.PreSaleStatus.pending
        );

        presaleParticipationCriteria = LaunchPadLib.PresaleParticipationCriteria (
            _criteriaTokenAddr,
            _minTokensForParticipation,
            _reqestedTokens,
            _presaleTimes
        );

        presalectCounts = LaunchPadLib.PresalectCounts (
            0,
            0
        );

    }

    function setAddresses(
        address _pancakeSwapFactoryAddr, 
        address _pancakeSwapRouterAddr, 
        address _WBNBAddr,
        address  _teamAddr,
        address _devAddr,
        address _lpLockerManager
        ) public onlyPresaleOwner {

        pancakeSwapFactoryAddr = _pancakeSwapFactoryAddr;
        pancakeSwapRouterAddr = _pancakeSwapRouterAddr; 
        WBNBAddr = _WBNBAddr;

        teamAddr = _teamAddr;
        devAddr = _devAddr;

        LPLockerManager = _lpLockerManager;
    }

    function validateBuyRequest(uint256 _numOfTokensRequested) internal {

        LaunchPadLib.PresaleInfo memory info = presaleInfo;
        LaunchPadLib.PresaleParticipationCriteria memory criteria = presaleParticipationCriteria;
        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];

        require(info.remainingTokensForSale > 0 , "the sale is sold out");

        if(info.typeOfPresale == LaunchPadLib.PresaleType.onlyWhiteListed){
            require( currentParticipant.isWhiteListed == true, "Only whitelisted users are allowed to participate");
        }
        
        if(info.typeOfPresale == LaunchPadLib.PresaleType.onlyTokenHolders){
            require(criteria.criteriaToken.balanceOf(msg.sender) >= criteria.minTokensForParticipation, "You don't hold enough criteria tokens");
        }

        require(_numOfTokensRequested <= info.remainingTokensForSale, "insufficient tokens to fulfill this order");
        require(msg.value >= _numOfTokensRequested*info.price, "insufficient funds");
        
        if(currentParticipant.tokens == 0) {
            presalectCounts.participantsCount++;
            require(_numOfTokensRequested >= criteria.reqestedTokens.minTokensReq, "Request for tokens is low, Please request more than minTokensReq");
        }

        require(_numOfTokensRequested + currentParticipant.tokens <= criteria.reqestedTokens.maxTokensReq, "Request for tokens is high, Please request less than maxTokensReq");


    }

    function buyTokensOnPresale(uint256 _numOfTokensRequested) public payable isPresaleActive {

        validateBuyRequest(_numOfTokensRequested);

        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];

        presaleInfo.accumulatedBalance = presaleInfo.accumulatedBalance.add(msg.value);
        presaleInfo.remainingTokensForSale = presaleInfo.remainingTokensForSale.sub(_numOfTokensRequested);

        uint newValue = currentParticipant.value.add(msg.value);
        uint newTokens = currentParticipant.tokens.add(_numOfTokensRequested);

        participant[msg.sender].value = newValue;
        participant[msg.sender].tokens = newTokens;
        
    }

    function finalizePresale() public onlyPresaleOwner {
        
        LaunchPadLib.PresaleInfo memory info = presaleInfo;

        require(info.preSaleStatus == LaunchPadLib.PreSaleStatus.inProgress, "Presale is not in progress");

        require (
            block.timestamp > presaleParticipationCriteria.presaleTimes.expiredAt ||
            info.remainingTokensForSale == 0,
            "Presale is not over yet"
        );
        
        uint256 totalTokensSold = info.tokensForSale.sub(info.remainingTokensForSale);
        
        if( totalTokensSold >= presaleParticipationCriteria.reqestedTokens.softCap ){
            
            uint256 tokensToAddLiquidity = totalTokensSold.mul(info.reservedTokensPCForLP).div(100);
            
                uint256 poolShareBNB = distributeRevenue();

                require(info.preSaleToken.approve(pancakeSwapRouterAddr, tokensToAddLiquidity), "unable to approve token tranfer to pancakeSwapRouterAddr");

                // (uint amountToken, uint amountETH, uint liquidity) = 
                IUniswapV2Router02(pancakeSwapRouterAddr).addLiquidityETH{value : poolShareBNB}(
                    address(info.preSaleToken),
                    tokensToAddLiquidity,
                    0,
                    0,
                    address(this),
                    block.timestamp + 5*60
                );

                require(lockLiquidity(), "liquidity lock is unseccessful");

                internalData.totalTokensSold = totalTokensSold;
                internalData.tokensAddedToLiquidity = tokensToAddLiquidity;
                internalData.extraTokens = info.remainingTokensForSale +  info.remainingTokensForSale.mul(info.reservedTokensPCForLP).div(100) ;
                presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.succeed;
           
        }
        else {

            internalData.extraTokens = info.tokensForSale +  info.tokensForSale.mul(info.reservedTokensPCForLP).div(100);
            presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.failed;

        }
        
    }

    function lockLiquidity() internal returns(bool) {
        
        LaunchPadLib.PresaleInfo memory info = presaleInfo;
        uint _lpLockupTime = presaleParticipationCriteria.presaleTimes.lpLockupTime;

        address pairAddress = IUniswapV2Factory(pancakeSwapFactoryAddr).getPair(address(info.preSaleToken), WBNBAddr);
        uint totalLPs = IERC20(pairAddress).balanceOf(address(this)); 

        require(IERC20(pairAddress).approve(LPLockerManager, totalLPs), "unable to approve token tranfer to pancakeSwapRouterAddr");
        uint _lockerID = ILPLokcerManager(LPLockerManager).createLPLcoker(info.presaleOwnerAddr, pairAddress, totalLPs, _lpLockupTime);

        internalData.totalLP = totalLPs;
        internalData.lockerID = _lockerID;
   
        return true;
    
    }

    function distributeRevenue() internal returns (uint256) {

        LaunchPadLib.PresaleInfo memory info = presaleInfo;

        uint256 revenueFromPresale = info.accumulatedBalance;

        uint256 devTeamShareBNB = revenueFromPresale.mul(salesFeeInPercent).div(100);
        uint256 poolShareBNB = revenueFromPresale.mul(info.reservedTokensPCForLP).div(100);
        uint256 ownersShareBNB = revenueFromPresale.sub(poolShareBNB.add(devTeamShareBNB));

        internalData.revenueFromPresale = revenueFromPresale;
        internalData.poolShareBNB = poolShareBNB;
        internalData.devTeamShareBNB = devTeamShareBNB;
        internalData.ownersShareBNB = ownersShareBNB;

        require(payable(info.presaleOwnerAddr).send(ownersShareBNB), "cannot send owner's share");
        // payable(info.presaleOwnerAddr).transfer(ownersShareBNB);

        uint devShare = devTeamShareBNB.mul(75).div(100);
        require(payable(devAddr).send(devShare), "cannot send dev's share"); 
        // payable(devAddr).transfer(devShare);

        uint teamShare = devTeamShareBNB.sub(devShare);
        require(payable(teamAddr).send(teamShare), "cannot send devTeam's share");
        // payable(teamAddr).transfer(teamShare);        

        return  poolShareBNB;


    }

    function claimTokensOrARefund() public  {
        
        LaunchPadLib.Participant memory _participant = participant[msg.sender];

        require(_participant.value > 0);

        IERC20 tokenAddress = presaleInfo.preSaleToken;

        participant[msg.sender].value = 0;
        participant[msg.sender].tokens = 0;

        presalectCounts.claimsCount++;

        LaunchPadLib.PreSaleStatus _status = presaleInfo.preSaleStatus;

        require(_status == LaunchPadLib.PreSaleStatus.succeed || _status == LaunchPadLib.PreSaleStatus.failed, "Presale is not concluded yet");

        uint avaialbelBalance = tokenAddress.balanceOf(address(this));
        
        if (_status == LaunchPadLib.PreSaleStatus.succeed){
            require(_participant.tokens > 0, "No tokens to claim");
            require(avaialbelBalance >= _participant.tokens , "Not enough tokens are available");
            bool tokenDistribution = tokenAddress.transfer(msg.sender, _participant.tokens);
            require(tokenDistribution, "Unable to transfer tokens to the participant");
        }
        else if(_status == LaunchPadLib.PreSaleStatus.failed) {
            require(_participant.value > 0, "No amount to refund");
            bool refund = payable(msg.sender).send(_participant.value);
            require(refund, "Unable to refund amount to the participant");
        }

    }

    function burnOrWithdrawTokens(LaunchPadLib.Withdrawtype _withdrawtype ) public onlyPresaleOwner  {

        uint tokensToReturn = internalData.extraTokens;
        
        require(tokensToReturn > 0, "No tokens to withdraw");

        internalData.extraTokens = 0;

        LaunchPadLib.PresaleInfo memory info = presaleInfo;

        if(_withdrawtype == LaunchPadLib.Withdrawtype.withdraw ){
            bool tokenDistribution = info.preSaleToken.transfer(msg.sender, tokensToReturn);
            assert( tokenDistribution);
        }
        else{
            bool tokenDistribution = info.preSaleToken.transfer(0x000000000000000000000000000000000000dEaD , tokensToReturn);
            assert( tokenDistribution );
        }
    }

    function chageSaleType(LaunchPadLib.PresaleType _type, address _address) public onlyPresaleOwner {
        if(_type == LaunchPadLib.PresaleType.onlyTokenHolders){
            presaleInfo.typeOfPresale = _type;
            presaleParticipationCriteria.criteriaToken = IERC20(_address);
        }
        else {
            presaleInfo.typeOfPresale = _type;
            presaleParticipationCriteria.criteriaToken = IERC20(address(0));
        }
    }

    function whiteListUsersToBuyTokens(address _address) public onlyPresaleOwner {
        participant[_address].isWhiteListed = true;
    }




}