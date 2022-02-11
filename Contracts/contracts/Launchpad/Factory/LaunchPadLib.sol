// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


library LaunchPadLib {

    enum PresaleType { PUBLIC, WHITELISTED, TOKENHOLDERS }
    enum PreSaleStatus {PENDING, INPROGRESS, SUCCEED, FAILED}
    enum RefundType {BURN, WITHDRAW}

    struct InternalData {
        uint totalTokensSold;
        uint revenueFromPresale;
        uint tokensAddedToLiquidity;
        uint extraTokens;
        uint poolShareBNB;
        uint devTeamShareBNB;
        uint ownersShareBNB;
        uint totalLPLocked;
        // uint lockerID;
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
        uint256 tokenLockupTime;
    }

    struct ReqestedTokens{
        uint256 minTokensReq;
        uint256 maxTokensReq;
        uint256 softCap;
    }

    struct PresalectCounts {
        uint256 remainingTokensForSale;
        uint256 accumulatedBalance;
        uint256 contributors;
        uint256 claimsCount;
    }
    
    struct PresaleInfo {
        uint id;
        PresaleType typeOfPresale;
        address preSaleToken;
        address presaleOwnerAddr;
        uint256 tokensForSale;              // 1000
        uint256 reservedTokensPCForLP;      // 70% = 0.7   =>   1700/1.7 = 700
        uint256 tokenForLocker;
        // PreSaleStatus preSaleStatus;
    }

    struct ParticipationCriteria {
        address criteriaToken;
        uint256 price;
        RefundType refundType;
        uint256 minTokensForParticipation;
        ReqestedTokens reqestedTokens;
        PresaleTimes presaleTimes;  
    }

    struct LaunchpadAddresses {
        address pancakeSwapFactoryAddr;
        address pancakeSwapRouterAddr;
        address WBNBAddr;
        address teamAddr;
        address devAddr;
    }


}