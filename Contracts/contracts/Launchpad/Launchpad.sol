//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


abstract contract ILockerFactory  {
    enum Type {TOKEN, LPTOKEN}
    function createLcoker(Type _type, address _owner, IERC20 _token, uint _numOfTokens, uint _unlockTime) virtual external returns(uint);
}



contract Launchpad is Ownable, ReentrancyGuard {

    using SafeMath for uint256;

    uint public count = 0;
    uint public upfrontfee = 0.2 ether;
    uint8 public salesFeeInPercent = 2;

    // Declare a set state variable    
    address public teamAddr;
    address public devAddr;
    
    //# PancakeSwap on BSC mainnet
    // address pancakeSwapFactoryAddr = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    // address pancakeSwapRouterAddr = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    // address WBNBAddr = 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c;
      
    //# PancakeSwap on BSC testnet:
    // address public pancakeSwapFactoryAddr = 0x6725F303b657a9451d8BA641348b6761A6CC7a17;
    // address public pancakeSwapRouterAddr = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;
    // address public WBNBAddr = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;    

    //# PancakeSwap on local network:
    address public pancakeSwapFactoryAddr;
    address public pancakeSwapRouterAddr;
    address public WBNBAddr;
    address public lockerFactoryAddr;

    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint256 => PresaleInfo) public presaleInfo;
    mapping(uint256 => PresalectCounts) public presalectCounts;
    mapping(uint256 => PresaleParticipationCriteria) public presaleParticipationCriteria;
    mapping(uint256 => uint8) public salesFeeInPercentForAProject;

    mapping(uint => uint) public LPrecord;

    mapping(uint256 => InternalData) public internalData;
    mapping(address => bool) public isUserWhitelistedToStartProject;
    mapping(uint256 => mapping(address => Participant)) public participant;

    ////////////////////////////// ENUMS ///////////////////////////////////

    enum PresaleType {open, onlyWhiteListed, onlyTokenHolders}
    enum PreSaleStatus {pending, inProgress, succeed, failed}
    enum Withdrawtype {burn, withdraw}

    ////////////////////////////// STRUCTS ///////////////////////////////////

    struct InternalData {
        uint totalTokensSold;
        uint revenueFromPresale;
        uint tokensAddedToLiquidity;
        uint extraTokens;
        uint poolShareBNB;
        uint devTeamShareBNB;
        uint ownersShareBNB;
        uint totalLP;
        uint lockerID;
    }

    struct Participant {
        uint256 value;
        uint256 tokens;
        bool isWhiteListed;
    }
    
    struct PresaleTimes{
        uint256 startedAt;
        uint256 expiredAt;
        uint256 lpLockupTime;
    }

    struct ReqestedTokens{
        uint256 minTokensReq;
        uint256 maxTokensReq;
        uint256 softCap;
    }

    struct PresalectCounts {
        uint256 participantsCount;
        uint256 claimsCount;
    }
    
    struct PresaleInfo {
        PresaleType typeOfPresale;
        IERC20 preSaleToken;
        address presaleOwnerAddr;
        uint256 price;
        uint256 tokensForSale;              // 1000
        uint256 reservedTokensPCForLP;      // 70% = 0.7   =>   1700/1.7 = 700
        uint256 remainingTokensForSale;
        uint256 accumulatedBalance;
        address pairAddress;
        PreSaleStatus preSaleStatus;
    }

    struct PresaleParticipationCriteria {
        IERC20 criteriaToken;
        uint256 minTokensForParticipation;
        ReqestedTokens reqestedTokens;
        PresaleTimes presaleTimes;  
    }

    ////////////////////////////// MODIFIRES //////////////////////////////

    modifier isIDValid(uint _id) {
        require (address(presaleInfo[_id].preSaleToken) != address(0), "Not a valid ID");
        _;
    }

    modifier isPresaleActive(uint _id) {
        require (block.timestamp >= presaleParticipationCriteria[_id].presaleTimes.startedAt, "Presale hasn't begin yet. please wait");
        require( block.timestamp < presaleParticipationCriteria[_id].presaleTimes.expiredAt, "Presale is over. Try next time");
        if(presaleInfo[_id].preSaleStatus == PreSaleStatus.pending){
            presaleInfo[_id].preSaleStatus = PreSaleStatus.inProgress;
        }
        require(presaleInfo[_id].preSaleStatus == PreSaleStatus.inProgress, "Presale is not in progress");
        _;
    }

    modifier onlyPresaleOwner(uint _id) {
        require(presaleInfo[_id].presaleOwnerAddr == _msgSender(), "Ownable: caller is not the owner of this presale");
        _;
    }

    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    constructor(
        address _pancakeSwapFactoryAddr, 
        address _pancakeSwapRouterAddr, 
        address _WBNBAddr,
        address  _teamAddr,
        address _devAddr,
        address _lockerFactoryAddr
        ){

        pancakeSwapFactoryAddr = _pancakeSwapFactoryAddr;
        pancakeSwapRouterAddr = _pancakeSwapRouterAddr; 
        WBNBAddr = _WBNBAddr;

        teamAddr = _teamAddr;
        devAddr = _devAddr;

        lockerFactoryAddr = _lockerFactoryAddr;
    }

    function whiteListUsersToStartProject(address _address) public onlyOwner {
        isUserWhitelistedToStartProject[_address] = true;
    }

    function whiteListUsersToBuyTokens(uint _id, address _address) public onlyPresaleOwner(_id) {
        participant[_id][_address].isWhiteListed = true;
    }

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function updateSalesFeeInPercentForAProject(uint _id, uint8 _fee) public onlyOwner {
        salesFeeInPercentForAProject[_id] = _fee;
    }

    function validateCreateInput (
        PresaleType _presaleType,
        IERC20 _preSaleToken,
        IERC20 _criteriaTokenAddr,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForSale,
        uint256 _priceOfEachToken,
        PresaleTimes memory _presaleTimes,
        ReqestedTokens memory _reqestedTokens
        ) private {
        
        require( address(_preSaleToken) != address(0), "Presale project address can't be null");
        
        bool needToPay = isUserWhitelistedToStartProject[msg.sender] || msg.sender == owner();

        if(!needToPay) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }
        
        if(_presaleType == PresaleType.onlyTokenHolders) {
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


    function createPresale (
        // Contract Info
        PresaleType _presaleType,
        IERC20 _preSaleToken,
        IERC20 _criteriaTokenAddr,
        uint8 _reservedTokensPCForLP,
        uint256 _tokensForSale,

        // Participation Criteria
        uint256 _priceOfEachToken,
        uint256 _minTokensForParticipation,
        PresaleTimes memory _presaleTimes,
        ReqestedTokens memory _reqestedTokens
        ) public payable returns(uint){

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
        
        presaleInfo[count] = PresaleInfo (
            _presaleType,
            _preSaleToken,
            msg.sender,

            _priceOfEachToken,
            _tokensForSale,                     // 1000    tokensForSale
            _reservedTokensPCForLP,
            _tokensForSale,                     // remainingTokensForSale = tokensForSale (initially)
            0,
            address(0),
            PreSaleStatus.pending
        );

        presaleParticipationCriteria[count] = PresaleParticipationCriteria (
            _criteriaTokenAddr,
            _minTokensForParticipation,
            _reqestedTokens,
            _presaleTimes
        );

        presalectCounts[count] = PresalectCounts (
            0,
            0
        );

        salesFeeInPercentForAProject[count] = salesFeeInPercent;       
        return count;
    }

    // function deletePresaleContractInfo (uint256 _id) public onlyPresaleOwner(_id) isIDValid(_id) {
    //     require(presaleInfo[_id].preSaleStatus == PreSaleStatus.pending, "Presale is in progress, can't delete it now");
    //     delete presaleInfo[_id];
    //     delete presalectCounts[_id];
    //     delete presaleParticipationCriteria[_id];
    //     // removeActiveSale(_id);
    // }

    function validateBuyRequest(uint256 _id, uint256 _numOfTokensRequested) internal {

        PresaleInfo memory info = presaleInfo[_id];
        PresaleParticipationCriteria memory criteria = presaleParticipationCriteria[_id];
        Participant memory currentParticipant = participant[_id][msg.sender];

        require(info.remainingTokensForSale > 0 , "the sale is sold out");

        if(info.typeOfPresale == PresaleType.onlyWhiteListed){
            require( currentParticipant.isWhiteListed == true, "Only whitelisted users are allowed to participate");
        }
        
        if(info.typeOfPresale == PresaleType.onlyTokenHolders){
            require(criteria.criteriaToken.balanceOf(msg.sender) >= criteria.minTokensForParticipation, "You don't hold enough criteria tokens");
        }

        require(_numOfTokensRequested <= info.remainingTokensForSale, "insufficient tokens to fulfill this order");
        require(msg.value >= _numOfTokensRequested*info.price, "insufficient funds");
        
        if(currentParticipant.tokens == 0) {
            presalectCounts[_id].participantsCount++;
            require(_numOfTokensRequested >= criteria.reqestedTokens.minTokensReq, "Request for tokens is low, Please request more than minTokensReq");
        }

        require(_numOfTokensRequested + currentParticipant.tokens <= criteria.reqestedTokens.maxTokensReq, "Request for tokens is high, Please request less than maxTokensReq");


    }

    function buyTokensOnPresale(uint256 _id, uint256 _numOfTokensRequested) public payable isIDValid(_id) isPresaleActive(_id) {

        validateBuyRequest(_id, _numOfTokensRequested);

        PresaleInfo memory info = presaleInfo[_id];
        Participant memory currentParticipant = participant[_id][msg.sender];

        presaleInfo[_id].accumulatedBalance = info.accumulatedBalance.add(msg.value);
        presaleInfo[_id].remainingTokensForSale = info.remainingTokensForSale.sub(_numOfTokensRequested);

        uint newValue = currentParticipant.value.add(msg.value);
        uint newTokens = currentParticipant.tokens.add(_numOfTokensRequested);

        participant[_id][msg.sender].value = newValue;
        participant[_id][msg.sender].tokens = newTokens;

        
    }

    function claimTokensOrARefund(uint _id) public isIDValid(_id) nonReentrant {
        
        Participant memory _participant = participant[_id][msg.sender];
        IERC20 tokenAddress = presaleInfo[_id].preSaleToken;

        participant[_id][msg.sender].value = 0;
        participant[_id][msg.sender].tokens = 0;
        presalectCounts[_id].claimsCount++;

        PreSaleStatus _status = presaleInfo[_id].preSaleStatus;

        require(_status == PreSaleStatus.succeed || _status == PreSaleStatus.failed, "Presale is not concluded yet");

        uint avaialbelBalance = tokenAddress.balanceOf(address(this));
        
        if (_status == PreSaleStatus.succeed){
            require(_participant.tokens > 0, "No tokens to claim");
            require(avaialbelBalance >= _participant.tokens , "Not enough tokens are available");
            bool tokenDistribution = tokenAddress.transfer(msg.sender, _participant.tokens);
            require(tokenDistribution, "Unable to transfer tokens to the participant");
        }
        else if(_status == PreSaleStatus.failed) {
            require(_participant.value > 0, "No amount to refund");
            bool refund = payable(msg.sender).send(_participant.value);
            require(refund, "Unable to refund amount to the participant");
        }

    }
    
    function endPresale(uint _id) public isIDValid(_id) onlyPresaleOwner(_id) nonReentrant {
        
        PresaleInfo memory info = presaleInfo[_id];

        require(info.preSaleStatus == PreSaleStatus.inProgress, "Presale is not in progress");

        require(
            block.timestamp > presaleParticipationCriteria[_id].presaleTimes.expiredAt ||
            info.remainingTokensForSale == 0,
            "Presale is not over yet"
        );
        
        uint256 totalTokensSold = info.tokensForSale.sub(info.remainingTokensForSale);
        
        if( totalTokensSold >= presaleParticipationCriteria[_id].reqestedTokens.softCap ){
            
            uint256 tokensToAddLiquidity = totalTokensSold.mul(info.reservedTokensPCForLP).div(100);
            
                uint256 poolShareBNB = distributeRevenue(_id);

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

                require(lockLiquidity(_id), "liquidity lock is unseccessful");

                internalData[_id].totalTokensSold = totalTokensSold;
                internalData[_id].tokensAddedToLiquidity = tokensToAddLiquidity;
                internalData[_id].extraTokens = info.remainingTokensForSale +  info.remainingTokensForSale.mul(info.reservedTokensPCForLP).div(100) ;
                presaleInfo[_id].preSaleStatus = PreSaleStatus.succeed;
           
        }
        else {

            internalData[_id].extraTokens = info.tokensForSale +  info.tokensForSale.mul(info.reservedTokensPCForLP).div(100);
            presaleInfo[_id].preSaleStatus = PreSaleStatus.failed;

        }
        
    }

    function lockLiquidity(uint _id) internal returns(bool) {
        
        PresaleInfo memory info = presaleInfo[_id];
        uint _lpLockupTime = presaleParticipationCriteria[_id].presaleTimes.lpLockupTime;

        address pairAddress = IUniswapV2Factory(pancakeSwapFactoryAddr).getPair(address(info.preSaleToken), WBNBAddr);
        uint totalLPs = IERC20(pairAddress).balanceOf(address(this)); 

        require(IERC20(pairAddress).approve(lockerFactoryAddr, totalLPs), "unable to approve token tranfer to pancakeSwapRouterAddr");
        uint _lockerID = ILockerFactory(lockerFactoryAddr).createLcoker(ILockerFactory.Type.LPTOKEN, info.presaleOwnerAddr, IERC20(pairAddress), totalLPs, _lpLockupTime);

        presaleInfo[_id].pairAddress = pairAddress;
        internalData[_id].totalLP = totalLPs;
        internalData[_id].lockerID = _lockerID;
   
        return true;
    
    }

    function distributeRevenue(uint _id) internal returns (uint256) {

        PresaleInfo memory info = presaleInfo[_id];

        uint256 revenueFromPresale = info.accumulatedBalance;
        // require(revenueFromPresale > 0, "No revenue to add liquidity");
        if(revenueFromPresale > 0) {

        uint256 devTeamShareBNB = revenueFromPresale.mul(salesFeeInPercentForAProject[_id]).div(100);
        uint256 poolShareBNB = revenueFromPresale.mul(info.reservedTokensPCForLP).div(100);
        uint256 ownersShareBNB = revenueFromPresale.sub(poolShareBNB.add(devTeamShareBNB));

        internalData[_id].revenueFromPresale = revenueFromPresale;
        internalData[_id].poolShareBNB = poolShareBNB;
        internalData[_id].devTeamShareBNB = devTeamShareBNB;
        internalData[_id].ownersShareBNB = ownersShareBNB;

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
       else {
           return 0;
       }


    }

    function burnOrWithdrawTokens(uint _id, Withdrawtype _withdrawtype ) public isIDValid(_id) onlyPresaleOwner(_id) nonReentrant {

        uint tokensToReturn = internalData[_id].extraTokens;
        require(tokensToReturn > 0, "No tokens to withdraw");
        internalData[_id].extraTokens = 0;

        PresaleInfo memory info = presaleInfo[_id];

        // IERC20 _token = info.preSaleToken;
        // uint totalTokens = info.preSaleToken.balanceOf(address(this));

        // require( totalTokens >= tokensToReturn, "Contract has no presale tokens");

        if(_withdrawtype == Withdrawtype.withdraw ){
            bool tokenDistribution = info.preSaleToken.transfer(msg.sender, tokensToReturn);
            assert( tokenDistribution);
        }
        else{
            bool tokenDistribution = info.preSaleToken.transfer(0x000000000000000000000000000000000000dEaD , tokensToReturn);
            assert( tokenDistribution );
        }
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