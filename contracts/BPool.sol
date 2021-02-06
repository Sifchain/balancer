// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.5.12;

import "./BMath.sol";
import "./OwnableWhitelist.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract BPool is BMath {

    using SafeERC20 for IERC20;

    event LOG_SWAP(
        address indexed caller,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256         tokenAmountIn,
        uint256         tokenAmountOut
    );

    event LOG_JOIN(
        address indexed caller,
        address indexed tokenIn,
        uint256         tokenAmountIn
    );

    event LOG_EXIT(
        address indexed caller,
        address indexed tokenOut,
        uint256         tokenAmountOut
    );

    event LOG_CALL(
        bytes4  indexed sig,
        address indexed caller,
        bytes           data
    ) anonymous;

    modifier _logs_() {
        emit LOG_CALL(msg.sig, msg.sender, msg.data);
        _;
    }

    modifier _lock_() {
        require(!_mutex, "ERR_REENTRY");
        _mutex = true;
        _;
        _mutex = false;
    }

    modifier _viewlock_() {
        require(!_mutex, "ERR_REENTRY");
        _;
    }

    modifier onlyWhitelisted(address _user, string memory _key) {
        require(
            OwnableWhitelist(_whiteListContract).validateWhitelistedUserAndKey(_user, _key),
            "ERR_NOT_WHITELISTED/INVALID_KEY"
        );
        _;
    }

    modifier onlyController() {
        require(msg.sender == _controller, "ERR_NOT_CONTROLLER");
        _;
    }

    bool private _mutex;
    address private _tokenIn;
    address private _tokenOut;
    address private _controller; // has CONTROL role

    // `finalize` requires CONTROL
    bool private _finalized;
    address[] private _tokens;
    mapping(address=>Record) private  _records;
    address private _whiteListContract;

    // address where all funds from token sale will go
    address public coldStorage;
    uint public gasPriceLimit;

    constructor(address _whitelist, address controller, address _coldStorage) public {
        _whiteListContract = _whitelist;
        _controller = controller;
        _finalized = false;
        coldStorage = _coldStorage;
        gasPriceLimit = 400000000;
    }

    function isFinalized()
        external view
        returns (bool)
    {
        return _finalized;
    }

    function isBound(address t)
        external view
        returns (bool)
    {
        return _records[t].bound;
    }

    function getNumTokens()
        external view
        returns (uint)
    {
        return _tokens.length;
    }

    function getCurrentTokens()
        external view _viewlock_
        returns (address[] memory tokens)
    {
        return _tokens;
    }

    function getFinalTokens()
        external view
        _viewlock_
        returns (address[] memory tokens)
    {
        require(_finalized, "ERR_NOT_FINALIZED");
        return _tokens;
    }

    function getBalance(address token)
        external view
        _viewlock_
        returns (uint)
    {
        require(_records[token].bound, "ERR_NOT_BOUND");
        return _records[token].balance;
    }

    function getController()
        external view
        _viewlock_
        returns (address)
    {
        return _controller;
    }

    function setController(address manager)
        external
        _logs_
        _lock_
        onlyController
    {
        _controller = manager;
    }

    function setTokenInOut(address tokenIn, address tokenOut)
        external
        _logs_
        _lock_
        onlyController
    {
        _tokenIn = tokenIn;
        _tokenOut = tokenOut;
    }

    function setGasPriceLimit(uint limit)
        external
        _logs_
        _lock_
        onlyController
    {
        gasPriceLimit = limit;
    }

    function finalize()
        external
        _logs_
        _lock_
        onlyController
    {
        require(!_finalized, "ERR_IS_FINALIZED");
        require(_tokens.length >= MIN_BOUND_TOKENS, "ERR_MIN_TOKENS");

        _finalized = true;
    }

    function bind(address token, uint balance)
        external
        _logs_
        onlyController
    {
        require(!_records[token].bound, "ERR_IS_BOUND");
        require(!_finalized, "ERR_IS_FINALIZED");
        require(_tokens.length <= MAX_BOUND_TOKENS, "ERR_MAX_TOKENS");

        _records[token] = Record({
            bound: true,
            index: _tokens.length,
            balance: 0
        });
        _tokens.push(token);
        rebind(token, balance);
    }

    function rebind(address token, uint balance)
        public
        _logs_
        _lock_
        onlyController
    {
        require(_records[token].bound, "ERR_NOT_BOUND");
        require(!_finalized, "ERR_IS_FINALIZED");
        require(balance >= MIN_BALANCE, "ERR_MIN_BALANCE");

        // Adjust the balance record and actual token balance
        uint oldBalance = _records[token].balance;
        _records[token].balance = balance;
        if (balance > oldBalance) {
            _pullUnderlying(token, msg.sender, bsub(balance, oldBalance));
        } else if (balance < oldBalance) {
            // In this case liquidity is being withdrawn
            uint tokenBalanceWithdrawn = bsub(oldBalance, balance);
            _pushUnderlying(token, msg.sender, tokenBalanceWithdrawn);
        }
    }

    // Absorb any tokens that have been sent to this contract into the pool
    function gulp(address token)
        external
        _logs_
        _lock_
        onlyController
    {
        require(_records[token].bound, "ERR_NOT_BOUND");
        _records[token].balance = IERC20(token).balanceOf(address(this));
    }

    function getSpotPrice(address tokenIn, address tokenOut)
        external view
        _viewlock_
        returns (uint spotPrice)
    {
        require(_records[tokenIn].bound, "ERR_NOT_BOUND");
        require(_records[tokenOut].bound, "ERR_NOT_BOUND");
        Record storage outRecord = _records[tokenOut];
        return calcSpotPrice(IN_BALANCE, outRecord.balance);
    }

    function exitPool(uint[] calldata minAmountsOut)
        external
        _logs_
        _lock_
        onlyController
    {
        require(_finalized, "ERR_NOT_FINALIZED");

        for (uint i = 0; i < _tokens.length; i++) {
            address t = _tokens[i];
            uint tokenAmountOut = IERC20(t).balanceOf(address(this));
            require(tokenAmountOut >= minAmountsOut[i], "ERR_LIMIT_OUT");
            _records[t].balance = bsub(_records[t].balance, tokenAmountOut);
            emit LOG_EXIT(msg.sender, t, tokenAmountOut);
            _pushUnderlying(t, coldStorage, tokenAmountOut);
        }

    }

    function withdrawAllLiquidity(address token)
        external
        _logs_
        _lock_
        onlyController
        returns (uint256)
    {
        uint256 amount = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(coldStorage, amount);

        emit LOG_EXIT(msg.sender, token, amount);

        return amount;
    }

    function swapExactAmountIn(
        uint tokenAmountIn,
        uint minAmountOut,
        uint maxPrice,
        string calldata _key
    )
        external
        _logs_
        _lock_
        onlyWhitelisted(msg.sender, _key)
        returns (uint tokenAmountOut, uint spotPriceAfter)
    {
        require(_records[_tokenIn].bound, "ERR_NOT_BOUND");
        require(_records[_tokenOut].bound, "ERR_NOT_BOUND");
        require(_finalized, "ERR_NOT_FINALIZED");
        require(tx.gasprice <= gasPriceLimit, "ERR_GAS_PRICE_LIMIT_EXCEEDED");

        Record storage inRecord = _records[address(_tokenIn)];
        Record storage outRecord = _records[address(_tokenOut)];

        require(tokenAmountIn >= MIN_SWAP_AMOUNT, "ERR_MIN_SWAP_AMOUNT");

        uint spotPriceBefore = calcSpotPrice(IN_BALANCE, outRecord.balance);
        require(spotPriceBefore <= maxPrice, "ERR_BAD_LIMIT_PRICE");

        tokenAmountOut = calcOutGivenIn(IN_BALANCE, outRecord.balance, tokenAmountIn);
        require(tokenAmountOut >= minAmountOut, "ERR_LIMIT_OUT");
        require(tokenAmountOut <= bmul(outRecord.balance, MAX_OUT_RATIO), "ERR_MAX_OUT_RATIO");

        inRecord.balance = badd(inRecord.balance, tokenAmountIn);
        outRecord.balance = bsub(outRecord.balance, tokenAmountOut);

        spotPriceAfter = calcSpotPrice(IN_BALANCE, outRecord.balance);
        require(spotPriceAfter >= spotPriceBefore, "ERR_MATH_APPROX");
        require(spotPriceAfter <= maxPrice, "ERR_LIMIT_PRICE");
        require(spotPriceBefore <= bdiv(tokenAmountIn * BONE_DIFF, tokenAmountOut), "ERR_MATH_APPROX");

        emit LOG_SWAP(msg.sender, _tokenIn, _tokenOut, tokenAmountIn, tokenAmountOut);

        _pullUnderlyingToColdStorage(_tokenIn, msg.sender, tokenAmountIn);
        _pushUnderlying(_tokenOut, msg.sender, tokenAmountOut);

        return (tokenAmountOut, spotPriceAfter);
    }

    function joinswapExternAmountIn(uint tokenAmountIn)
        external
        _logs_
        _lock_
        onlyController
    {
        require(_finalized, "ERR_NOT_FINALIZED");
        require(_records[_tokenOut].bound, "ERR_NOT_BOUND");

        Record storage outRecord = _records[_tokenOut];

        outRecord.balance = badd(outRecord.balance, tokenAmountIn);

        emit LOG_JOIN(msg.sender, _tokenOut, tokenAmountIn);

        _pullUnderlying(_tokenOut, msg.sender, tokenAmountIn);
    }

    // 'Underlying' token-manipulation functions make external calls but are NOT locked
    // You must `_lock_` or otherwise ensure reentry-safety
    function _pullUnderlying(address erc20, address from, uint amount)
        internal
    {
        IERC20(erc20).safeTransferFrom(from, address(this), amount);
    }

    function _pullUnderlyingToColdStorage(address erc20, address from, uint amount)
        internal
    {
        // send tokens to cold storage, instead of the smart contract
        IERC20(erc20).safeTransferFrom(from, coldStorage, amount);
    }

    function _pushUnderlying(address erc20, address to, uint amount)
        internal
    {
        IERC20(erc20).safeTransfer(to, amount);
    }
}
