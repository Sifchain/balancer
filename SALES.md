## swapExactAmountIn

```
swapExactAmountIn(
    uint tokenAmountIn,
    uint minAmountOut,
    uint maxPrice,
    string calldata key
)
    returns (uint tokenAmountOut, uint spotPriceAfter)
```

Trades an exact **tokenAmountIn** of USDT token taken from the caller by the pool, in exchange for at least **minAmountOut** of eRowan token given to the caller from the pool, with a maximum marginal price of **maxPrice**.

Returns (**tokenAmountOut**, **spotPriceAfter**), where **tokenAmountOut** is the amount of token that came out of the pool, and **spotPriceAfter** is the new marginal spot price, ie, the result of getSpotPrice after the call. These values are what are limited by the arguments; you are guaranteed **tokenAmountOut** >= **minAmountOut** and **spotPriceAfter** <= **maxPrice**.

Only callers who have valid **key** are allowed to call this function. **key** is issued per user after the KYC is done. This **key** is never stored in smart contract. The hash of this **key** is stored instead.

To perform this transaction USDT token must be approved by the caller using standard ERC20 interface:

```
function approve(address spender, uint256 value) 
  public returns (bool success)
```

Where **spender** is pool address and **value** is at least **tokenAmountIn**.
