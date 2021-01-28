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

function calcSpotPrice(tokenBalanceIn, tokenBalanceOut) {
    return Decimal(tokenBalanceIn).div(Decimal(tokenBalanceOut));
}

function calcOutGivenIn(tokenBalanceIn, tokenBalanceOut, tokenAmountIn) {
    const delta = Decimal(tokenBalanceIn).div(Decimal(tokenBalanceIn).plus(Decimal(tokenAmountIn)));
    const coeff = Decimal(1).minus(delta);
    return Decimal(tokenBalanceOut).times(coeff);
}

module.exports = {
    calcSpotPrice,
    calcOutGivenIn,
    calcRelativeDiff,
    logState
};
