// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;


library LaunchPadLib {

    enum PresaleType { PUBLIC, WHITELISTED, TOKENHOLDERS }
    enum PreSaleStatus {PENDING, INPROGRESS, SUCCEED, FAILED, CANCELED}
    enum RefundType {BURN, WITHDRAW}

    struct InternalData {
        uint totalTokensSold;
        uint revenueFromPresale;
        uint tokensAddedToLiquidity;
        uint extraTokens;
        uint poolShareBNB;
        uint devTeamShareBNB;
        uint ownersShareBNB;
    }

    struct Participant {
        uint256 value;
        uint256 tokens;
    }
    
    struct PresaleTimes{
        uint256 startedAt;
        uint256 expiredAt;
        uint256 lpLockupDuration;
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
        address presaleOwner;
        PreSaleStatus preSaleStatus;
    }

    struct ParticipationCriteria {
        uint256 tokensForSale;              // 1000
        uint256 tokensPCForLP;              // 70% = 0.7   =>   1700/1.7 = 700
        PresaleType typeOfPresale;
        uint256 priceOfEachToken;
        address criteriaToken;
        uint256 minTokensForParticipation;
        RefundType refundType;
    }

    // struct LaunchpadAddresses {
    //     address pancakeSwapRouterAddr;
    // }

    struct TokenInfo {
        address preSaleToken;
        string name;
        string symbol;
        uint decimals;
    }

    struct ContributorsVesting {
        bool isEnabled;
        uint firstReleasePC;
        uint vestingPeriodOfEachCycle;
        uint tokensReleaseEachCyclePC;
    }

    struct TeamVesting {
        bool isEnabled;
        uint vestingTokens;
        uint firstReleaseTime;
        uint firstReleasePC;
        uint vestingPeriodOfEachCycle;
        uint tokensReleaseEachCyclePC;
    }

}