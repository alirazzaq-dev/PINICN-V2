// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;


library LaunchPadLib {

    enum PresaleType {PUBLIC, WHITELISTED, TOKENHOLDERS}
    enum PreSaleStatus {PENDING, INPROGRESS, SUCCEED, FAILED, CANCELED}
    enum RefundType {BURN, WITHDRAW}

    // struct GeneralInfo {
    //     string logoURL;
    //     string websiteURL;
    //     string twitterURL;
    //     string telegramURL;
    //     string discordURL;
    //     string description;
    // }

    // struct Participant {
    //     uint256 value;
    //     uint256 tokens;
    // }
    
    // struct PresaleTimes {
    //     uint256 startedAt;
    //     uint256 expiredAt;
    //     uint256 lpLockupDuration;
    // }

    // struct ReqestedTokens {
    //     uint256 minTokensReq;
    //     uint256 maxTokensReq;
    //     uint256 softCap;
    // }

    // struct PresalectCounts {
    //     uint256 remainingTokensForSale;
    //     uint256 accumulatedBalance;
    //     uint256 contributors;
    //     uint256 claimsCount;
    // }
    
    // struct PresaleInfo {
    //     uint id;
    //     address presaleOwner;
    //     PreSaleStatus preSaleStatus;
    //     address preSaleToken;
    //     uint decimals;
    // }

    // struct ParticipationCriteria {
    //     uint256 tokensForSale;             
    //     uint8 tokensPCForLP;
    //     PresaleType typeOfPresale;
    //     uint256 priceOfEachToken;
    //     address criteriaToken;
    //     uint256 minTokensForParticipation;
    //     RefundType refundType;
    // }

    // struct ContributorsVesting {
    //     bool isEnabled;
    //     uint firstReleasePC;
    //     uint vestingPeriodOfEachCycle;
    //     uint tokensReleaseEachCyclePC;
    // }

    // struct TeamVesting {
    //     bool isEnabled;
    //     uint vestingTokens;
    //     uint firstReleaseTime;
    //     uint firstReleasePC;
    //     uint vestingPeriodOfEachCycle;
    //     uint tokensReleaseEachCyclePC;
    // }

    // struct TokenInfo {
    // }

    struct PresaleInfo {
        uint id;
        address presaleOwner;
        PreSaleStatus preSaleStatus;
    }

    struct TokenInfo {
        address tokenAddress;
        uint8 decimals;
    }

    struct ParticipationCriteria {
        PresaleType saleType;
        string criteriaTokenAddress;
        uint256 minCriteriaTokens;
        uint256 presaleRate;
        uint8 liquidity;
        uint256 hardCap;
        uint256 softCap;
        uint256 minBuy;
        uint256 maxBuy;
        RefundType refundType;
    }

    struct PresaleTimes {
        uint256 startedAt;
        uint256 expiredAt;
        uint256 lpLockupDuration;
    }

    struct PresalectCounts {
        uint256 accumulatedBalance;
        uint256 contributors;
        uint256 claimsCount;
    }

    struct ContributorsVesting {
        bool isEnabled;
        uint firstReleasePC;
        uint eachCycleDuration;
        uint8 eachCyclePC;
    }

    struct TeamVesting {
        bool isEnabled;
        uint vestingTokens;
        uint firstReleaseTime;
        uint firstReleasePC;
        uint eachCycleDuration;
        uint8 eachCyclePC;
    }

    struct GeneralInfo {
        string logoURL;
        string websiteURL;
        string twitterURL;
        string telegramURL;
        string discordURL;
        string description;
    }

    struct Participant {
        uint256 value;
        uint256 tokens;
    }



    /*
        Things need to start a presale

        - Token Address
        - SaleType (PUBLIC, WHITELISTED, TOKENHOLDERS)
        - CriteriaTokenAddress (address)
        - MinCriteriaTokens (uint)

        - Presale rate:  1 BNB = ___ Tokens:  Tokens in 1 BNB 
        - HardCap (BNBs)
        - Softcap (BNBs)
        - MinBuy (BNBs)
        - MaxBuy (BNBs)
        - RefundType
        - RouterType
        - Liquidity (unit8)

        - StartingTime (uint)
        - EndingTime (uint)
        - lpLockupDuration (uint)

        - ContributorsVesting (bool)
        - CVFirstReleasePC (uint)
        - CVEachCyclePeriod (uint)
        - CVEachReleasePC (uint)

        - TokenLocker (Bool)
        - TokensLocked (uint)
        - TokensReleaseTime (uint)

        - TokenLockerVesting (uint)
        - TLFirstReleaseTime (uint)
        - TLEachCyclePeriod (uint)
        - TLEachReleasePC (uint)
    
        - logoURL (string)
        - websiteURL (string)
        - twitterURL (string)
        - telegramURL (string)
        - discordURL (string)
        - description (string)

    */


}