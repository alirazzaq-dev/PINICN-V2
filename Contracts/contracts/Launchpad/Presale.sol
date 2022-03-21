// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// import "hardhat/console.sol";
import "./LaunchPadLib.sol";

contract Presale is Ownable {

    using LaunchPadLib for *;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private whiteListedUsers; 
    EnumerableSet.AddressSet private contributorsList; 

    address immutable public master;

    uint8 public salesFeeInPercent;
    // LaunchPadLib.LaunchpadAddresses public launchpadAddresses;
    IUniswapV2Router02 public uniswapV2Router02;
    
    LaunchPadLib.PresaleInfo public presaleInfo;
    LaunchPadLib.ParticipationCriteria public participationCriteria;
    // LaunchPadLib.Tokenomics public tokenomics;
    LaunchPadLib.PresaleTimes public presaleTimes;

    LaunchPadLib.ReqestedTokens public reqestedTokens;
    LaunchPadLib.TokenInfo public tokenInfo;
    LaunchPadLib.PresalectCounts public presaleCounts;
    LaunchPadLib.InternalData public internalData;

    LaunchPadLib.ContributorsVesting public contributorsVesting;
    LaunchPadLib.TeamVesting public teamVesting;

    mapping(address => LaunchPadLib.Participant) public participant;

    mapping (uint => ContributorsVestingRecord) public contributorVestingRecord;
    uint public contributorCycles = 0;
    enum ReleaseStatus {UNRELEASED,RELEASED}
    mapping(uint => mapping(address => ReleaseStatus)) internal releaseStatus;
    struct ContributorsVestingRecord {
        uint cycle;
        uint releaseTime;
        uint tokensPC;
        uint percentageToRelease;
    }

    mapping (uint => TeamVestingRecord) public teamVestingRecord;
    uint public temaVestingCycles = 0;
    struct TeamVestingRecord {
        uint cycle;
        uint releaseTime;
        uint tokensPC;
        uint percentageToRelease;
        ReleaseStatus releaseStatus;
    }


    modifier isPresaleActive() {
        require (block.timestamp >= presaleTimes.startedAt, "Presale hasn't begin yet. please wait");
        require( block.timestamp < presaleTimes.expiredAt, "Presale is over. Try next time");
        if(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.PENDING){
            presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.INPROGRESS;
        }
        require(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");
        _;
    }

    modifier onlyPresaleOwner() {
        require(presaleInfo.presaleOwner == _msgSender(), "Ownable: caller is not the owner of this presale");
        _;
    }

    modifier isPresaleEnded(){
        require (
            presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED || 
            presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.FAILED || 
            presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.CANCELED, 
            "Presale is not concluded yet"
        );
        _;
    }

    modifier isPresaleNotEnded() {
        require(
            presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS || 
            presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.PENDING, 
            "Presale is not in progress"
        );
        _;
    }

    constructor (
        uint8 _salesFeeInPercent,
        LaunchPadLib.PresaleInfo memory _presaleInfo,
        LaunchPadLib.TokenInfo memory _tokenInfo,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        // LaunchPadLib.LaunchpadAddresses memory _launchpadAddresses,
        address _uniswapV2Router02,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting
    ){
        master = _msgSender();
        // transferOwnership(_presaleInfo.presaleOwner);
        salesFeeInPercent = _salesFeeInPercent;
        presaleCounts = LaunchPadLib.PresalectCounts(_participationCriteria.tokensForSale, 0, 0, 0 );
        presaleInfo = _presaleInfo;
        participationCriteria = _participationCriteria;
        presaleTimes = _presaleTimes;
        reqestedTokens = _reqestedTokens;
        tokenInfo = _tokenInfo;
        uniswapV2Router02 = IUniswapV2Router02(_uniswapV2Router02);
        contributorsVesting = _contributorsVesting;
        teamVesting = _teamVesting;

        if(_contributorsVesting.isEnabled){
            findContributorsVesting(_contributorsVesting, _presaleTimes.expiredAt);
        }

        if(_teamVesting.isEnabled){
            findTeamVesting(_teamVesting, _presaleTimes.expiredAt);
        }
    }

    function findContributorsVesting(LaunchPadLib.ContributorsVesting memory _contributorsVesting, uint expiredAt ) internal {
            uint totalTokensPC = 100;
            uint initialReleasePC = (totalTokensPC * _contributorsVesting.firstReleasePC) / 100;
            contributorVestingRecord[0] = ContributorsVestingRecord(
                0, 
                expiredAt, 
                totalTokensPC, 
                initialReleasePC
                );

            if(initialReleasePC < totalTokensPC){

                uint remaingTokenPC = totalTokensPC - initialReleasePC;
                uint cycles = totalTokensPC / _contributorsVesting.tokensReleaseEachCyclePC;
                contributorCycles = cycles;
                uint assignedTokensPC;

                for(uint i = 1; i <= cycles; i++ ){
                    uint cycleReleaseTime = expiredAt + _contributorsVesting.vestingPeriodOfEachCycle * ( i * 1 minutes );
                    contributorVestingRecord[i] = ContributorsVestingRecord(
                        i, 
                        cycleReleaseTime, 
                        remaingTokenPC, 
                        _contributorsVesting.tokensReleaseEachCyclePC
                    );
                    assignedTokensPC += _contributorsVesting.tokensReleaseEachCyclePC;
                }
                    uint difference = totalTokensPC - assignedTokensPC;
                    contributorVestingRecord[cycles].percentageToRelease += difference;
            }

    }

    function findTeamVesting(LaunchPadLib.TeamVesting memory _teamVesting, uint expiredAt ) internal {
            
            uint totalLockedTokensPC = 100;
            uint initialReleasePC = (totalLockedTokensPC * _teamVesting.firstReleasePC) / 100;
            uint initialReleaseTime = expiredAt + _teamVesting.firstReleaseTime * 1 minutes;
            teamVestingRecord[0] = TeamVestingRecord(
                0, 
                initialReleaseTime, 
                totalLockedTokensPC, 
                initialReleasePC,
                ReleaseStatus.UNRELEASED 
                );


            if(initialReleasePC < totalLockedTokensPC){
                uint remaingTokenPC = totalLockedTokensPC - initialReleasePC;
                uint cycles = totalLockedTokensPC / _teamVesting.tokensReleaseEachCyclePC;
                temaVestingCycles = cycles;
                uint assignedTokensPC;

                for(uint i = 1; i <= cycles; i++ ){

                    uint cycleReleaseTime = initialReleaseTime + _teamVesting.vestingPeriodOfEachCycle * ( i * 1 minutes );
                    teamVestingRecord[i] = TeamVestingRecord(
                        i, 
                        cycleReleaseTime, 
                        remaingTokenPC, 
                        _teamVesting.tokensReleaseEachCyclePC,
                        ReleaseStatus.UNRELEASED
                    );
                    
                    assignedTokensPC += _teamVesting.tokensReleaseEachCyclePC;
                }

                    uint difference = totalLockedTokensPC - assignedTokensPC;
                    teamVestingRecord[cycles].percentageToRelease += difference;
            }
    }

    function buyTokensOnPresale(uint256 numOfTokensRequested) public payable isPresaleActive {

        LaunchPadLib.Participant memory currentParticipant = participant[_msgSender()];

        require(msg.value >= (numOfTokensRequested * participationCriteria.priceOfEachToken ) , "insufficient funds");
        
        require(presaleCounts.remainingTokensForSale > 0 , "the sale is sold out");
        require(numOfTokensRequested <= presaleCounts.remainingTokensForSale, "insufficient tokens to fulfill this order");

        if(participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.WHITELISTED){
            require( isWhiteListed(_msgSender()), "Only whitelisted users are allowed to participate");   
        }
        
        if(participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS){
            require(IERC20(participationCriteria.criteriaToken).balanceOf(_msgSender()) >= participationCriteria.minTokensForParticipation, "You don't hold enough criteria tokens");
        }
        
        if(currentParticipant.tokens == 0) {
            require(numOfTokensRequested >= reqestedTokens.minTokensReq, "Request for tokens is low, Please request more than minTokensReq");
            presaleCounts.contributors++;
        }

        require(numOfTokensRequested + currentParticipant.tokens <= reqestedTokens.maxTokensReq, "Request for tokens is high, Please request less than maxTokensReq");

        presaleCounts.accumulatedBalance = presaleCounts.accumulatedBalance + msg.value;
        presaleCounts.remainingTokensForSale = presaleCounts.remainingTokensForSale - numOfTokensRequested;

        uint newValue = currentParticipant.value + msg.value;
        uint newTokens = currentParticipant.tokens + numOfTokensRequested;
        
        participant[_msgSender()].value = newValue;
        participant[_msgSender()].tokens = newTokens;

        EnumerableSet.add(contributorsList, _msgSender());
        
    }

    function finalizePresale() public onlyPresaleOwner {
        
        require(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");
        require (
            block.timestamp > presaleTimes.expiredAt ||
            presaleCounts.remainingTokensForSale == 0,
            "Presale is not over yet"
        );
        
        uint256 totalTokensSold = participationCriteria.tokensForSale - presaleCounts.remainingTokensForSale;
        
        if( totalTokensSold >= reqestedTokens.softCap ){
            
            uint256 tokensToAddLiquidity = (totalTokensSold * participationCriteria.tokensPCForLP) / 100;
            
                uint256 poolShareBNB = distributeRevenue();
                uint tokensForLiquidity = tokensToAddLiquidity * 10**tokenInfo.decimals;
                require(IERC20(tokenInfo.preSaleToken).approve(address(uniswapV2Router02), tokensForLiquidity), "unable to approve token tranfer to pancakeSwapRouterAddr");
                uniswapV2Router02.addLiquidityETH{value : poolShareBNB}(
                    tokenInfo.preSaleToken,
                    tokensForLiquidity,
                    0,
                    0,
                    address(this),
                    block.timestamp + 60
                );

                // addLiquidity(tokensToAddLiquidity, poolShareBNB);
                internalData.totalTokensSold = totalTokensSold;
                internalData.tokensAddedToLiquidity = tokensToAddLiquidity;

                uint remainingTokensFromLP = (presaleCounts.remainingTokensForSale * participationCriteria.tokensPCForLP ) / 100;
                // uint tokensToReturn = (presaleCounts.remainingTokensForSale + remainingTokensFromLP) * 10**tokenInfo.decimals; 

                internalData.extraTokens = (presaleCounts.remainingTokensForSale + remainingTokensFromLP) * 10**tokenInfo.decimals;
                // extraTokensOnSeccess();
                
                presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.SUCCEED;
                withdrawExtraTokens();
           
        }
        else {

            presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.FAILED;
            internalData.extraTokens = IERC20(tokenInfo.preSaleToken).balanceOf(address(this));
            participationCriteria.tokensForSale = 0;
            participationCriteria.tokensPCForLP = 0;
            withdrawExtraTokens();

        }        
    }

    function distributeRevenue() internal returns (uint256) {

        uint256 revenueFromPresale = presaleCounts.accumulatedBalance;
        uint256 poolShareBNB = (revenueFromPresale * participationCriteria.tokensPCForLP) / 100;
        uint256 devTeamShareBNB = (revenueFromPresale * salesFeeInPercent) / 100;
        uint256 ownersShareBNB = revenueFromPresale - (poolShareBNB + devTeamShareBNB);

        internalData.revenueFromPresale = revenueFromPresale;
        internalData.poolShareBNB = poolShareBNB;
        internalData.devTeamShareBNB = devTeamShareBNB;
        internalData.ownersShareBNB = ownersShareBNB;

        (bool res1,) = payable(presaleInfo.presaleOwner).call{value: ownersShareBNB}("");
        require(res1, "cannot send devTeamShare"); 

        (bool res2,) = payable(master).call{value: devTeamShareBNB}("");
        require(res2, "cannot send devTeamShare"); 
        
        return  poolShareBNB;


    }

    function claimTokensOrARefund() public isPresaleEnded {

        LaunchPadLib.Participant memory _participant = participant[_msgSender()];
        require(_participant.value > 0, "Nothing to claim");

        presaleCounts.claimsCount++;

        uint avaialbelBalance = IERC20(tokenInfo.preSaleToken).balanceOf(address(this));
 
        if (presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED){

            if(contributorsVesting.isEnabled == false){
                participant[_msgSender()].value = 0;
                participant[_msgSender()].tokens = 0;

                require(_participant.tokens > 0, "No tokens to claim");
                require(avaialbelBalance >= _participant.tokens , "Not enough tokens are available");
                
                bool tokenDistribution = IERC20(tokenInfo.preSaleToken).transfer(_msgSender(), _participant.tokens * 10**tokenInfo.decimals);
                require(tokenDistribution, "Unable to transfer tokens to the participant");
            }
            else {
                uint tokensLocked = _participant.tokens * 10**tokenInfo.decimals;
                uint tokensToRelease;

                for(uint i = 0; i<= contributorCycles; i++){
                    if(block.timestamp >= contributorVestingRecord[i].releaseTime && releaseStatus[contributorVestingRecord[i].releaseTime][_msgSender()] == ReleaseStatus.UNRELEASED){
                        tokensToRelease += (tokensLocked * contributorVestingRecord[i].tokensPC * contributorVestingRecord[i].percentageToRelease) / 10000;
                        releaseStatus[contributorVestingRecord[i].releaseTime][_msgSender()] = ReleaseStatus.RELEASED;
                    }
                }

                require(tokensToRelease > 0, "Nothing to unlock");
                require(
                    IERC20(tokenInfo.preSaleToken).transfer(_msgSender(), tokensToRelease),
                    "Unable to transfer presale tokens to the presale owner"
                    );


            }
        
        
        }
        else {
            participant[_msgSender()].value = 0;
            participant[_msgSender()].tokens = 0;

            require(_participant.value > 0, "No amount to refund");
            bool refund = payable(_msgSender()).send(_participant.value);
            require(refund, "Unable to refund amount to the participant");
        }

    }

    function withdrawExtraTokens() internal {

        uint tokensToReturn = internalData.extraTokens;
        
        // console.log("tokensToReturn ", tokensToReturn);

        if(tokensToReturn > 0){
            internalData.extraTokens = 0;

            if(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.FAILED || presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.CANCELED){
                bool tokenDistribution = IERC20(tokenInfo.preSaleToken).transfer(presaleInfo.presaleOwner, tokensToReturn);
                assert( tokenDistribution);
            }
            else if(participationCriteria.refundType == LaunchPadLib.RefundType.WITHDRAW ){
                bool tokenDistribution = IERC20(tokenInfo.preSaleToken).transfer(presaleInfo.presaleOwner, tokensToReturn);
                assert( tokenDistribution);
            }
            else{
                bool tokenDistribution = IERC20(tokenInfo.preSaleToken).transfer(0x000000000000000000000000000000000000dEaD , tokensToReturn);
                assert( tokenDistribution );
            }
        }
    }

    function chageSaleType(LaunchPadLib.PresaleType _type, address _address, uint minimumTokens) public onlyPresaleOwner {
        if(_type == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( _address != address(0), "Criteria token address can't be null");
            participationCriteria.typeOfPresale = _type;
            participationCriteria.criteriaToken = _address;
            participationCriteria.minTokensForParticipation = minimumTokens;
        }
        else {
            participationCriteria.typeOfPresale = _type;
        }
    }

    function unlockTokens() public onlyPresaleOwner isPresaleEnded {

        require(teamVesting.isEnabled, "No tokens were locked");

        uint tokensLocked = teamVesting.vestingTokens * 10**tokenInfo.decimals;
        uint tokensToRelease;

        for(uint i = 0; i<= temaVestingCycles; i++){            
            if(block.timestamp >= teamVestingRecord[i].releaseTime && teamVestingRecord[i].releaseStatus == ReleaseStatus.UNRELEASED){
                    tokensToRelease += (tokensLocked * teamVestingRecord[i].tokensPC * teamVestingRecord[i].percentageToRelease) / 10000;
                    teamVestingRecord[i].releaseStatus = ReleaseStatus.RELEASED;
            }
        }

        require(tokensToRelease > 0, "Nothing to unlock");
        require(
            IERC20(tokenInfo.preSaleToken).transfer(_msgSender(), tokensToRelease),
            "Unable to transfer presale tokens to the presale owner"
            );

    }

    function unlockLPTokens() public onlyPresaleOwner isPresaleEnded {

        address factory = IUniswapV2Router02(uniswapV2Router02).factory();
        address WBNBAddr = IUniswapV2Router02(uniswapV2Router02).WETH();

        address pairAddress = IUniswapV2Factory(factory).getPair(tokenInfo.preSaleToken, WBNBAddr);
        uint availableLP = IERC20(pairAddress).balanceOf(address(this));

        require(availableLP > 0, "Nothing to claim");
        require(block.timestamp >= presaleTimes.expiredAt + presaleTimes.lpLockupDuration, "Not unlocked yet");

        bool res = IERC20(pairAddress).transfer(presaleInfo.presaleOwner, availableLP);
        require(res, "Unable to transfer presale tokens to the presale owner");

    }

    function whiteListUsers(address[] memory _addresses) public onlyPresaleOwner {
        for(uint i=0; i < _addresses.length; i++){
                EnumerableSet.add(whiteListedUsers, _addresses[i]); 
        }
    }

    function removeWhiteListUsers(address[] memory _addresses) public onlyPresaleOwner {
        for(uint i=0; i < _addresses.length; i++){
            EnumerableSet.remove(whiteListedUsers, _addresses[i]); 
        }
    }

    function getWhiteListUsers() public view returns (address[] memory) {
        return EnumerableSet.values(whiteListedUsers);
    }

    function getContributorsList() public view returns (address[] memory) {
        return EnumerableSet.values(contributorsList);
    }

    function isWhiteListed(address _address) public view returns(bool) {
        return EnumerableSet.contains(whiteListedUsers, _address);
    }
    
    function emergencyWithdraw() public {

        require(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");

        LaunchPadLib.Participant memory currentParticipant = participant[_msgSender()];
        require(currentParticipant.value > 0, "Nothing to withdraw");

        uint valueToReturn = (currentParticipant.value * 98) / 100;

        participant[_msgSender()].value = 0;
        participant[_msgSender()].tokens = 0;
        
        presaleCounts.accumulatedBalance = presaleCounts.accumulatedBalance - currentParticipant.value;
        presaleCounts.remainingTokensForSale = presaleCounts.remainingTokensForSale + currentParticipant.tokens;

        presaleCounts.contributors--;
        
        (bool res1,) = payable(_msgSender()).call{value: valueToReturn}("");
        require(res1, "cannot refund to contributors"); 

        (bool res2,) = payable(master).call{value: currentParticipant.value - valueToReturn}("");
        require(res2, "cannot send devTeamShare"); 

        EnumerableSet.remove(contributorsList, _msgSender());

    }

    function cancelSale() public onlyPresaleOwner isPresaleNotEnded {
        presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.CANCELED;
        internalData.extraTokens = IERC20(tokenInfo.preSaleToken).balanceOf(address(this));
        withdrawExtraTokens();
    }

    function getContributorReleaseStatus(uint time, address _address) public view returns(ReleaseStatus){
        return releaseStatus[time][_address];
    }

}