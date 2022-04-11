
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: LaunchPad/LaunchPadLib.sol


pragma solidity 0.8.7;


library LaunchPadLib {

    enum PresaleType {PUBLIC, WHITELISTED, TOKENHOLDERS}
    enum PreSaleStatus {PENDING, INPROGRESS, SUCCEED, FAILED, CANCELED}
    enum RefundType {BURN, WITHDRAW}

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
    
    struct PresaleTimes {
        uint256 startedAt;
        uint256 expiredAt;
        uint256 lpLockupDuration;
    }

    struct ReqestedTokens {
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
        address preSaleToken;
        uint decimals;
    }

    struct ParticipationCriteria {
        uint256 tokensForSale;             
        uint256 tokensPCForLP;
        PresaleType typeOfPresale;
        uint256 priceOfEachToken;
        address criteriaToken;
        uint256 minTokensForParticipation;
        RefundType refundType;
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
// File: @openzeppelin/contracts/utils/structs/EnumerableSet.sol


// OpenZeppelin Contracts v4.4.1 (utils/structs/EnumerableSet.sol)

pragma solidity ^0.8.0;

/**
 * @dev Library for managing
 * https://en.wikipedia.org/wiki/Set_(abstract_data_type)[sets] of primitive
 * types.
 *
 * Sets have the following properties:
 *
 * - Elements are added, removed, and checked for existence in constant time
 * (O(1)).
 * - Elements are enumerated in O(n). No guarantees are made on the ordering.
 *
 * ```
 * contract Example {
 *     // Add the library methods
 *     using EnumerableSet for EnumerableSet.AddressSet;
 *
 *     // Declare a set state variable
 *     EnumerableSet.AddressSet private mySet;
 * }
 * ```
 *
 * As of v3.3.0, sets of type `bytes32` (`Bytes32Set`), `address` (`AddressSet`)
 * and `uint256` (`UintSet`) are supported.
 */
library EnumerableSet {
    // To implement this library for multiple types with as little code
    // repetition as possible, we write it in terms of a generic Set type with
    // bytes32 values.
    // The Set implementation uses private functions, and user-facing
    // implementations (such as AddressSet) are just wrappers around the
    // underlying Set.
    // This means that we can only create new EnumerableSets for types that fit
    // in bytes32.

    struct Set {
        // Storage of set values
        bytes32[] _values;
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping(bytes32 => uint256) _indexes;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function _add(Set storage set, bytes32 value) private returns (bool) {
        if (!_contains(set, value)) {
            set._values.push(value);
            // The value is stored at length-1, but we add 1 to all indexes
            // and use 0 as a sentinel value
            set._indexes[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function _remove(Set storage set, bytes32 value) private returns (bool) {
        // We read and store the value's index to prevent multiple reads from the same storage slot
        uint256 valueIndex = set._indexes[value];

        if (valueIndex != 0) {
            // Equivalent to contains(set, value)
            // To delete an element from the _values array in O(1), we swap the element to delete with the last one in
            // the array, and then remove the last element (sometimes called as 'swap and pop').
            // This modifies the order of the array, as noted in {at}.

            uint256 toDeleteIndex = valueIndex - 1;
            uint256 lastIndex = set._values.length - 1;

            if (lastIndex != toDeleteIndex) {
                bytes32 lastvalue = set._values[lastIndex];

                // Move the last value to the index where the value to delete is
                set._values[toDeleteIndex] = lastvalue;
                // Update the index for the moved value
                set._indexes[lastvalue] = valueIndex; // Replace lastvalue's index to valueIndex
            }

            // Delete the slot where the moved value was stored
            set._values.pop();

            // Delete the index for the deleted slot
            delete set._indexes[value];

            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function _contains(Set storage set, bytes32 value) private view returns (bool) {
        return set._indexes[value] != 0;
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function _at(Set storage set, uint256 index) private view returns (bytes32) {
        return set._values[index];
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function _values(Set storage set) private view returns (bytes32[] memory) {
        return set._values;
    }

    // Bytes32Set

    struct Bytes32Set {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _add(set._inner, value);
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(Bytes32Set storage set, bytes32 value) internal returns (bool) {
        return _remove(set._inner, value);
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(Bytes32Set storage set, bytes32 value) internal view returns (bool) {
        return _contains(set._inner, value);
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(Bytes32Set storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(Bytes32Set storage set, uint256 index) internal view returns (bytes32) {
        return _at(set._inner, index);
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(Bytes32Set storage set) internal view returns (bytes32[] memory) {
        return _values(set._inner);
    }

    // AddressSet

    struct AddressSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(AddressSet storage set, address value) internal returns (bool) {
        return _add(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(AddressSet storage set, address value) internal returns (bool) {
        return _remove(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(AddressSet storage set, address value) internal view returns (bool) {
        return _contains(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(AddressSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(AddressSet storage set, uint256 index) internal view returns (address) {
        return address(uint160(uint256(_at(set._inner, index))));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(AddressSet storage set) internal view returns (address[] memory) {
        bytes32[] memory store = _values(set._inner);
        address[] memory result;

        assembly {
            result := store
        }

        return result;
    }

    // UintSet

    struct UintSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(UintSet storage set, uint256 value) internal returns (bool) {
        return _add(set._inner, bytes32(value));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(UintSet storage set, uint256 value) internal returns (bool) {
        return _remove(set._inner, bytes32(value));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(UintSet storage set, uint256 value) internal view returns (bool) {
        return _contains(set._inner, bytes32(value));
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function length(UintSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(UintSet storage set, uint256 index) internal view returns (uint256) {
        return uint256(_at(set._inner, index));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(UintSet storage set) internal view returns (uint256[] memory) {
        bytes32[] memory store = _values(set._inner);
        uint256[] memory result;

        assembly {
            result := store
        }

        return result;
    }
}

// File: @uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol

pragma solidity >=0.5.0;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}

// File: @uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol

pragma solidity >=0.6.2;

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

// File: @uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol

pragma solidity >=0.6.2;


interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: LaunchPad/Presale.sol

// // SPDX-License-Identifier: MIT
pragma solidity 0.8.7;






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

// File: LaunchPad/Launchpadv2.sol


pragma solidity 0.8.7;






contract Launchpadv2 is Ownable {
    
    using LaunchPadLib for *;

    uint public presaleCount = 0;
    uint public upfrontfee = 2 ether;
    uint8 public salesFeeInPercent = 2;

    address public uniswapV2Router02 = 0x10ED43C718714eb63d5aA57B78B54704E256024E;    // BSC Mainnet router
    // address public uniswapV2Router02 = 0xD99D1c33F9fC3444f8101754aBC46c52416550D1;    // BSC Testnet router

    address public teamAddr = 0xaEEE930D7Dc148862051CC0F43114FedAbAF34BC;
    address public devAddr = 0x2a1706e0B87373445c500621a47cb26484D1DdfF;

    // address public uniswapV2Router02;
    // address public teamAddr;
    // address public devAddr;
    
    ////////////////////////////// MAPPINGS ///////////////////////////////////

    mapping(uint => address) public presaleRecordByID;
    mapping(address => address[]) private presaleRecordByToken;

    ////////////////////////////// FUNCTIONS ///////////////////////////////////

    // constructor(address _a, address _b, address _c){
    //     uniswapV2Router02 = _a;
    //     teamAddr = _b;
    //     devAddr = _c;
    // }

    function createPresale(
        LaunchPadLib.PresaleInfo memory _presaleInfo,
        LaunchPadLib.ParticipationCriteria memory _participationCriteria,
        LaunchPadLib.PresaleTimes memory _presaleTimes,
        LaunchPadLib.ReqestedTokens memory _reqestedTokens,
        LaunchPadLib.ContributorsVesting memory _contributorsVesting,
        LaunchPadLib.TeamVesting memory _teamVesting,
        LaunchPadLib.GeneralInfo memory _generalInfo
        ) public payable {

        // require( address(_presaleInfo.preSaleToken) != address(0), "Presale project address can't be null");
                    
        if(_participationCriteria.typeOfPresale == LaunchPadLib.PresaleType.TOKENHOLDERS) {
            require( _participationCriteria.criteriaToken != address(0), "Criteria token address can't be null");
        }

        if(_teamVesting.isEnabled){
            require(_teamVesting.vestingTokens > 0, "Vesting tokens should be more than zero");
        }

        require( _participationCriteria.tokensPCForLP >= 20 && _participationCriteria.tokensPCForLP <= 95, "liquidity should be between 20%-95%");


        require( _reqestedTokens.minTokensReq > 0, "_minTokensReq should be more than zero");
        require( _reqestedTokens.maxTokensReq > _reqestedTokens.minTokensReq, "_maxTokensReq > _minTokensReq");
        require( _reqestedTokens.softCap >= (_participationCriteria.tokensForSale / 2), "softcap should be at least 50% or more");

        require ( _presaleTimes.startedAt > block.timestamp, "startedAt should be more than from now" );
        require ( _presaleTimes.expiredAt > _presaleTimes.startedAt, "expiredAt should be more than one day from now" );
        require ( _presaleTimes.lpLockupDuration > 0, "Lockup period should be  7 or more days from now time" );

        require ( 
            _participationCriteria.priceOfEachToken > 0 &&
            _participationCriteria.tokensForSale > 0
            , "Price and Tokens for sale shoule be more than zero" );

        if(msg.sender != owner()) {
            require( msg.value >= upfrontfee, "Insufficient funds to start");
        }

        presaleCount++;
        
        _presaleInfo.id = presaleCount;
        _presaleInfo.presaleOwner = msg.sender;
        _presaleInfo.preSaleStatus = LaunchPadLib.PreSaleStatus.PENDING;

        Presale _presale = new Presale ( 
                salesFeeInPercent,
                _presaleInfo,
                _participationCriteria,
                _presaleTimes,
                _reqestedTokens,
                uniswapV2Router02,
                _contributorsVesting,
                _teamVesting,
                _generalInfo
        );


        uint tokensForSale = _participationCriteria.tokensForSale * 10**_presaleInfo.decimals;
        uint tokensForLP = (tokensForSale * _participationCriteria.tokensPCForLP) / 100;
        uint tokensForVesting = _teamVesting.vestingTokens * 10**_presaleInfo.decimals;

        uint totalTokens = tokensForSale + tokensForLP + tokensForVesting;

        require(
            IERC20(_presaleInfo.preSaleToken).transferFrom(msg.sender, address(_presale), totalTokens),
             "Unable to transfer presale tokens to the contract"
            );
                   
        presaleRecordByToken[_presaleInfo.preSaleToken].push(address(_presale));
        presaleRecordByID[presaleCount] = address(_presale);

    }

    function getPresaleRecordsByToken(address _address) public view returns(address[] memory) {
        return presaleRecordByToken[_address];
    }

    function updateFees(uint _upfrontFee, uint8 _salesFeeInPercent) public onlyOwner {
        upfrontfee = _upfrontFee;
        salesFeeInPercent = _salesFeeInPercent;
    }

    function withdrawBNBs() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 , "nothing to withdraw");

        uint teamShare = (balance * 70) / 100;       

        (bool res1,) = payable(teamAddr).call{value: teamShare}("");
        require(res1, "cannot send team Share"); 


        (bool res2,) = payable(devAddr).call{value: balance - teamShare}("");
        require(res2, "cannot send devTeamShare"); 


    }
    
    function updateTeamAddress(address _address) public onlyOwner {
        teamAddr = _address;
    }

    function updateDevAddress(address _address) public {
        require(devAddr == address(msg.sender), "Only dev is allowed");
        devAddr = _address;
    }

    receive() external payable {}

}
