const Decimal = require('decimal.js');
const { toWei, fromWei } = web3.utils;

async function logState(pool, rowan, usdt, ROWAN, USDT, user, controller) {
    const rowanBalance = await pool.getBalance(ROWAN);
    console.log(`Rowan amount in pool : ${fromWei(rowanBalance)}`);

    if(parseInt(fromWei(rowanBalance))) {
      const rowanPrice = await pool.getSpotPrice(USDT, ROWAN);
      console.log(`Rowan price: ${fromWei(rowanPrice, 'mwei')}`);
    }

    const userRowanBalance = await rowan.balanceOf(user);
    console.log(`Rowan User Balance: ${fromWei(userRowanBalance)}`);
    const controllerRowanBalance = await rowan.balanceOf(controller);
    console.log(`Rowan Controller Balance: ${fromWei(controllerRowanBalance)}`);
    const userUsdtBalance = await usdt.balanceOf(user);
    console.log(`USDT User Balance: ${fromWei(userUsdtBalance, 'mwei')}`);
    const controllerUsdtBalance = await usdt.balanceOf(controller);
    console.log(`USDT Controller Balance: ${fromWei(controllerUsdtBalance, 'mwei')}`);
    const usdtBalance = await pool.getBalance(USDT);
    console.log(`USDT amount in pool : ${fromWei(usdtBalance, 'mwei')}`);
    console.log('');
}

function calcRelativeDiff(expected, actual) {
    return ((Decimal(expected).minus(Decimal(actual))).div(expected)).abs();
}

function calcSpotPrice(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, swapFee) {
    const numer = Decimal(tokenBalanceIn).div(Decimal(tokenWeightIn));
    const denom = Decimal(tokenBalanceOut).div(Decimal(tokenWeightOut));
    const ratio = numer.div(denom);
    const scale = Decimal(1).div(Decimal(1).sub(Decimal(swapFee)));
    const spotPrice = ratio.mul(scale);
    return spotPrice;
}

function calcOutGivenIn(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountIn, swapFee) {
    const weightRatio = Decimal(tokenWeightIn).div(Decimal(tokenWeightOut));
    const adjustedIn = Decimal(tokenAmountIn).times((Decimal(1).minus(Decimal(swapFee))));
    const y = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(adjustedIn));
    const foo = y.pow(weightRatio);
    const bar = Decimal(1).minus(foo);
    const tokenAmountOut = Decimal(tokenBalanceOut).times(bar);
    return tokenAmountOut;
}

function calcInGivenOut(tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut, tokenAmountOut, swapFee) {
    const weightRatio = Decimal(tokenWeightOut).div(Decimal(tokenWeightIn));
    const diff = Decimal(tokenBalanceOut).minus(tokenAmountOut);
    const y = Decimal(tokenBalanceOut).div(diff);
    const foo = y.pow(weightRatio).minus(Decimal(1));
    const tokenAmountIn = (Decimal(tokenBalanceIn).times(foo)).div(Decimal(1).minus(Decimal(swapFee)));
    return tokenAmountIn;
}

function calcPoolOutGivenSingleIn(tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, tokenAmountIn, swapFee) {
    const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
    const zaz = Decimal(1).sub(Decimal(normalizedWeight)).mul(Decimal(swapFee));
    const tokenAmountInAfterFee = Decimal(tokenAmountIn).mul(Decimal(1).sub(zaz));
    const newTokenBalanceIn = Decimal(tokenBalanceIn).add(tokenAmountInAfterFee);
    const tokenInRatio = newTokenBalanceIn.div(Decimal(tokenBalanceIn));
    const poolRatio = tokenInRatio.pow(normalizedWeight);
    const newPoolSupply = poolRatio.mul(Decimal(poolSupply));
    const poolAmountOut = newPoolSupply.sub(Decimal(poolSupply));
    return poolAmountOut;
}

function calcSingleInGivenPoolOut(tokenBalanceIn, tokenWeightIn, poolSupply, totalWeight, poolAmountOut, swapFee) {
    const normalizedWeight = Decimal(tokenWeightIn).div(Decimal(totalWeight));
    const newPoolSupply = Decimal(poolSupply).plus(Decimal(poolAmountOut));
    const poolRatio = newPoolSupply.div(Decimal(poolSupply));
    const boo = Decimal(1).div(normalizedWeight);
    const tokenInRatio = poolRatio.pow(boo);
    const newTokenBalanceIn = tokenInRatio.mul(Decimal(tokenBalanceIn));
    const tokenAmountInAfterFee = newTokenBalanceIn.sub(Decimal(tokenBalanceIn));
    const zar = (Decimal(1).sub(normalizedWeight)).mul(Decimal(swapFee));
    const tokenAmountIn = tokenAmountInAfterFee.div(Decimal(1).sub(zar));
    return tokenAmountIn;
}

module.exports = {
    calcSpotPrice,
    calcOutGivenIn,
    calcInGivenOut,
    calcPoolOutGivenSingleIn,
    calcSingleInGivenPoolOut,
    calcRelativeDiff,
    logState
};