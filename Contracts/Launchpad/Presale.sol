// // SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./LaunchPadLib.sol";

contract Presale {

    using LaunchPadLib for *;
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private whiteListedUsers;

    address immutable public master;

    uint8 public salesFeeInPercent;
    IUniswapV2Router02 public uniswapV2Router02;
    
    LaunchPadLib.PresaleInfo public presaleInfo;
    LaunchPadLib.ParticipationCriteria public participationCriteria;
    LaunchPadLib.PresaleTimes public presaleTimes;

    LaunchPadLib.ReqestedTokens public reqestedTokens;
    LaunchPadLib.PresalectCounts public presaleCounts;
    LaunchPadLib.GeneralInfo public generalInfo;
    uint public extraTokens;

    LaunchPadLib.ContributorsVesting public contributorsVesting;
    LaunchPadLib.TeamVesting public teamVesting;

    mapping(address => LaunchPadLib.Participant) public participant;

    mapping (uint => ContributorsVestingRecord) public contributorVestingRecord;
    uint public contributorCycles = 0;
    uint public finalizingTime;

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
        require(presaleInfo.presaleOwner == msg.sender, "Ownable: caller is not the owner of this presale");
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
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        address _uniswapV2Router02,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting,
        LaunchPadLib.GeneralInfo memory _generalInfo      
    ){
        master = msg.sender;
        salesFeeInPercent = _salesFeeInPercent;
        presaleCounts = LaunchPadLib.PresalectCounts(_participationCriteria.tokensForSale, 0, 0, 0 );
        presaleInfo = _presaleInfo;
        participationCriteria = _participationCriteria;
        presaleTimes = _presaleTimes;
        reqestedTokens = _reqestedTokens;
        uniswapV2Router02 = IUniswapV2Router02(_uniswapV2Router02);
        contributorsVesting = _contributorsVesting;
        teamVesting = _teamVesting;
        generalInfo = _generalInfo;

        if(_contributorsVesting.isEnabled){
            findContributorsVesting(_contributorsVesting);
        }

        if(_teamVesting.isEnabled){
            findTeamVesting(_teamVesting);
        }
    }

    function findContributorsVesting(LaunchPadLib.ContributorsVesting memory _contributorsVesting) internal {
            uint totalTokensPC = 100;
            uint initialReleasePC = _contributorsVesting.firstReleasePC;
            contributorVestingRecord[0] = ContributorsVestingRecord(
                0, 
                0, 
                totalTokensPC, 
                initialReleasePC
            );

            if(initialReleasePC < totalTokensPC){

                uint remaingTokenPC = totalTokensPC - initialReleasePC;
                contributorCycles = totalTokensPC / _contributorsVesting.tokensReleaseEachCyclePC;
                uint assignedTokensPC;

                for(uint i = 1; i <= contributorCycles; i++ ){
                    uint cycleReleaseTime = _contributorsVesting.vestingPeriodOfEachCycle * ( i * 1 minutes );
                    contributorVestingRecord[i] = ContributorsVestingRecord(
                        i, 
                        cycleReleaseTime, 
                        remaingTokenPC, 
                        _contributorsVesting.tokensReleaseEachCyclePC
                    );
                    assignedTokensPC += _contributorsVesting.tokensReleaseEachCyclePC;
                }
                    uint difference = totalTokensPC - assignedTokensPC;
                    contributorVestingRecord[contributorCycles].percentageToRelease += difference;
            }

    }

    function findTeamVesting(LaunchPadLib.TeamVesting memory _teamVesting) internal {
            
            uint totalLockedTokensPC = 100;
            uint initialReleasePC = _teamVesting.firstReleasePC;
            uint initialReleaseTime = _teamVesting.firstReleaseTime * 1 minutes;
            teamVestingRecord[0] = TeamVestingRecord(
                0, 
                initialReleaseTime, 
                totalLockedTokensPC, 
                initialReleasePC,
                ReleaseStatus.UNRELEASED 
            );


            if(initialReleasePC < totalLockedTokensPC){
                uint remaingTokenPC = totalLockedTokensPC - initialReleasePC;
                temaVestingCycles = totalLockedTokensPC / _teamVesting.tokensReleaseEachCyclePC;
                uint assignedTokensPC;

                for(uint i = 1; i <= temaVestingCycles; i++ ){

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
                    teamVestingRecord[temaVestingCycles].percentageToRelease += difference;
            }
    }

    function buyTokensOnPresale(uint256 numOfTokensRequested) public payable isPresaleActive {

        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];

        require(msg.value >= (numOfTokensRequested * participationCriteria.priceOfEachToken ) , "insufficient funds");
        
        require(presaleCounts.remainingTokensForSale > 0 , "the sale is sold out");
        require(numOfTokensRequested <= presaleCounts.remainingTokensForSale, "insufficient tokens to fulfill this order");

        if(participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.WHITELISTED){
            require( EnumerableSet.contains(whiteListedUsers, msg.sender), "Only whitelisted users are allowed to participate");   
        }
        
        if(participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS){
            require(IERC20(participationCriteria.criteriaToken).balanceOf(msg.sender) >= participationCriteria.minTokensForParticipation, "You don't hold enough criteria tokens");
        }
        
        if(currentParticipant.tokens == 0) {
            require(numOfTokensRequested >= reqestedTokens.minTokensReq, "Request for tokens is low, Please request more than minTokensReq");
            presaleCounts.contributors++;
        }

        require(numOfTokensRequested + currentParticipant.tokens <= reqestedTokens.maxTokensReq, "Request for tokens is high, Please request less than maxTokensReq");

        presaleCounts.accumulatedBalance = presaleCounts.accumulatedBalance + msg.value;
        presaleCounts.remainingTokensForSale = presaleCounts.remainingTokensForSale - numOfTokensRequested;
       
        participant[msg.sender].value = currentParticipant.value + msg.value;
        participant[msg.sender].tokens = currentParticipant.tokens + numOfTokensRequested;
        
    }

    function finalizePresale() public onlyPresaleOwner isPresaleNotEnded {
        
        require (
            block.timestamp > presaleTimes.expiredAt ||
            presaleCounts.remainingTokensForSale == 0,
            "Presale is not over yet"
        );
        
        uint256 totalTokensSold = participationCriteria.tokensForSale - presaleCounts.remainingTokensForSale;
        
        if( totalTokensSold >= reqestedTokens.softCap ){
            
            uint256 tokensToAddLiquidity = (totalTokensSold * participationCriteria.tokensPCForLP) / 100;
            
                uint256 revenueFromPresale = presaleCounts.accumulatedBalance;
                uint256 poolShareBNB = (revenueFromPresale * participationCriteria.tokensPCForLP) / 100;
                uint256 devTeamShareBNB = (revenueFromPresale * salesFeeInPercent) / 100;
                uint256 ownersShareBNB = revenueFromPresale - (poolShareBNB + devTeamShareBNB);

                (bool res1,) = payable(presaleInfo.presaleOwner).call{value: ownersShareBNB}("");
                require(res1, "cannot send devTeamShare"); 

                (bool res2,) = payable(master).call{value: devTeamShareBNB}("");
                require(res2, "cannot send devTeamShare"); 


                uint tokensForLiquidity = tokensToAddLiquidity * 10**presaleInfo.decimals;
                
                IERC20(presaleInfo.preSaleToken).approve(address(uniswapV2Router02), tokensForLiquidity);

                uniswapV2Router02.addLiquidityETH{value : poolShareBNB}(
                    presaleInfo.preSaleToken,
                    tokensForLiquidity,
                    0,
                    0,
                    address(this),
                    block.timestamp + 60
                );

                uint remainingTokensFromLP = (presaleCounts.remainingTokensForSale * participationCriteria.tokensPCForLP ) / 100;
                extraTokens = (presaleCounts.remainingTokensForSale + remainingTokensFromLP) * 10**presaleInfo.decimals;
                
                presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.SUCCEED;
                withdrawExtraTokens();
                finalizingTime = block.timestamp;
           
        }
        else {

            presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.FAILED;
            extraTokens = IERC20(presaleInfo.preSaleToken).balanceOf(address(this));
            withdrawExtraTokens();

        }        
    }

    function claimTokensOrARefund() public isPresaleEnded {

        LaunchPadLib.Participant memory _participant = participant[msg.sender];
        require(_participant.value > 0, "Nothing to claim");
 
        if (presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.SUCCEED) {

            if(!contributorsVesting.isEnabled){
                // participant[msg.sender].value = 0;
                participant[msg.sender].tokens = 0;
                participant[msg.sender].value = 0;
                presaleCounts.claimsCount++;

                require(_participant.tokens > 0, "No tokens to claim");
                bool tokenDistribution = IERC20(presaleInfo.preSaleToken).transfer(msg.sender, _participant.tokens * 10**presaleInfo.decimals);
                require(tokenDistribution, "Unable to transfer tokens to the participant");

            }
            else {

                uint tokensLocked = _participant.tokens * 10**presaleInfo.decimals;
                uint tokensToRelease;

                for(uint i = 0; i<= contributorCycles; i++){
                    if(
                        block.timestamp >= (finalizingTime + contributorVestingRecord[i].releaseTime) && 
                        releaseStatus[finalizingTime + contributorVestingRecord[i].releaseTime][msg.sender] == ReleaseStatus.UNRELEASED
                        ){
                        tokensToRelease += (tokensLocked * contributorVestingRecord[i].tokensPC * contributorVestingRecord[i].percentageToRelease) / 10000;
                        releaseStatus[finalizingTime + contributorVestingRecord[i].releaseTime][msg.sender] = ReleaseStatus.RELEASED;

                        if(i == contributorCycles) {
                            participant[msg.sender].value = 0;
                            participant[msg.sender].tokens = 0;
                            presaleCounts.claimsCount++;
                        }
                    }
                }

                require(tokensToRelease > 0, "Nothing to unlock");
                require(
                    IERC20(presaleInfo.preSaleToken).transfer(msg.sender, tokensToRelease),
                    "Unable to transfer presale tokens to the presale owner"
                    );
            }
        }
        else {
            participant[msg.sender].tokens = 0;
            participant[msg.sender].value = 0;
            presaleCounts.claimsCount++;

            require(_participant.value > 0, "No amount to refund");
            bool refund = payable(msg.sender).send(_participant.value);
            require(refund, "Unable to refund amount to the participant");
        }

    }

    function withdrawExtraTokens() internal {

        uint tokensToReturn = extraTokens;

        if(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.FAILED || presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.CANCELED){
            bool tokenDistribution = IERC20(presaleInfo.preSaleToken).transfer(presaleInfo.presaleOwner, tokensToReturn);
            assert( tokenDistribution);
        }
        else if(participationCriteria.refundType == LaunchPadLib.RefundType.WITHDRAW ){
            bool tokenDistribution = IERC20(presaleInfo.preSaleToken).transfer(presaleInfo.presaleOwner, tokensToReturn);
            assert( tokenDistribution);
        }
        else{
            bool tokenDistribution = IERC20(presaleInfo.preSaleToken).transfer(0x000000000000000000000000000000000000dEaD , tokensToReturn);
            assert( tokenDistribution );
        }

    }

    function chageSaleType(LaunchPadLib.PresaleType _type, address _address, uint minimumTokens) public onlyPresaleOwner {
        if(_type == LaunchPadLib.PresaleType.TOKENHOLDERS) {
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

        uint tokensLocked = teamVesting.vestingTokens * 10**presaleInfo.decimals;
        uint tokensToRelease;

        for(uint i = 0; i<= temaVestingCycles; i++){            
            if(block.timestamp >= finalizingTime + teamVestingRecord[i].releaseTime && teamVestingRecord[i].releaseStatus == ReleaseStatus.UNRELEASED){
                    tokensToRelease += (tokensLocked * teamVestingRecord[i].tokensPC * teamVestingRecord[i].percentageToRelease) / 10000;
                    teamVestingRecord[i].releaseStatus = ReleaseStatus.RELEASED;
            }
        }

        require(tokensToRelease > 0, "Nothing to unlock");
        require(
            IERC20(presaleInfo.preSaleToken).transfer(msg.sender, tokensToRelease),
            "Unable to transfer presale tokens to the presale owner"
            );

    }

    function unlockLPTokens() public onlyPresaleOwner isPresaleEnded {

        address factory = IUniswapV2Router02(uniswapV2Router02).factory();
        address WBNBAddr = IUniswapV2Router02(uniswapV2Router02).WETH();

        address pairAddress = IUniswapV2Factory(factory).getPair(presaleInfo.preSaleToken, WBNBAddr);
        uint availableLP = IERC20(pairAddress).balanceOf(address(this));

        require(availableLP > 0, "Nothing to claim");
        require(block.timestamp >= finalizingTime + presaleTimes.lpLockupDuration, "Not unlocked yet");
        
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

    function emergencyWithdraw() public {

        require(presaleInfo.preSaleStatus == LaunchPadLib.PreSaleStatus.INPROGRESS, "Presale is not in progress");

        LaunchPadLib.Participant memory currentParticipant = participant[msg.sender];
        require(currentParticipant.value > 0, "Nothing to withdraw");

        uint valueToReturn = (currentParticipant.value * 95) / 100;

        participant[msg.sender].value = 0;
        participant[msg.sender].tokens = 0;
        
        presaleCounts.accumulatedBalance = presaleCounts.accumulatedBalance - currentParticipant.value;
        presaleCounts.remainingTokensForSale = presaleCounts.remainingTokensForSale + currentParticipant.tokens;

        presaleCounts.contributors--;
        
        (bool res1,) = payable(msg.sender).call{value: valueToReturn}("");
        require(res1, "cannot refund to contributors"); 

        (bool res2,) = payable(master).call{value: currentParticipant.value - valueToReturn}("");
        require(res2, "cannot send devTeamShare"); 

    }

    function cancelSale() public onlyPresaleOwner isPresaleNotEnded {
        presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.CANCELED;
        extraTokens = IERC20(presaleInfo.preSaleToken).balanceOf(address(this));
        withdrawExtraTokens();
    }

    function getContributorReleaseStatus(uint _time, address _address) public view returns(ReleaseStatus){
        return releaseStatus[_time][_address];
    }

    function updateGeneralInfo(LaunchPadLib.GeneralInfo memory _generalInfo) public {
        generalInfo = _generalInfo;
    }

}
