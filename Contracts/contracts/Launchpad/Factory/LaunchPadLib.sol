//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library LaunchPadLib {

    enum PresaleType {open, onlyWhiteListed, onlyTokenHolders}
    enum PreSaleStatus {pending, inProgress, succeed, failed}
    enum Withdrawtype {burn, withdraw}

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
        uint id;
        PresaleType typeOfPresale;
        IERC20 preSaleToken;
        address presaleOwnerAddr;
        uint256 price;
        uint256 tokensForSale;              // 1000
        uint256 reservedTokensPCForLP;      // 70% = 0.7   =>   1700/1.7 = 700
        uint256 remainingTokensForSale;
        uint256 accumulatedBalance;
        PreSaleStatus preSaleStatus;
    }

    struct PresaleParticipationCriteria {
        IERC20 criteriaToken;
        uint256 minTokensForParticipation;
        ReqestedTokens reqestedTokens;
        PresaleTimes presaleTimes;  
    }



}