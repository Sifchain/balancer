const iToken = artifacts.require("IERC20");
const BPool = artifacts.require("BPool");
const pool_address = BPool.address;
const { toWei } = web3.utils;

// parameters
const tokenRowanAmount = 15000000;
const tokenUSDTAmount = 45000;
const weightRowan = 10;
const weightUsdt = 1;

module.exports = function(cb) {
  addLiquidity(cb);
}

async function addLiquidity(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const eRowanContract = await iToken.at(process.env.EROWAN);
    const usdtContract = await iToken.at(process.env.USDT);
    const bpool = await BPool.at(pool_address);
    console.log("Pool address: " + pool_address);
    console.log("eRowan address: " + eRowanContract.address);
    console.log("USDT address: " + usdtContract.address);

    // first approve and let the bpool have access to 120,000,000 eRowan tokens
    let res = await eRowanContract.approve(pool_address, toWei(tokenRowanAmount.toString()), { from: controller });
    console.log('tx Rowan approved: ' + JSON.stringify(res));

    res = await usdtContract.approve(pool_address, toWei(tokenUSDTAmount.toString(), "mwei"), { from: controller });
    console.log('\n\n\n\n\n\n\ntx USDT approved: ' + JSON.stringify(res));

    // then bind eRowan and USDT to the contract
    res = await bpool.bind(eRowanContract.address, toWei(tokenRowanAmount.toString()), toWei(weightRowan.toString()), { from: controller });
    console.log('\n\n\n\n\n\n\ntx Rowan bound: ' + JSON.stringify(res));
    res = await bpool.bind(usdtContract.address, toWei(tokenUSDTAmount.toString(), "mwei"), toWei(weightUsdt.toString()), { from: controller });
    console.log('\n\n\n\n\n\n\ntx USDT bound: ' + JSON.stringify(res));

    // now finalize
    await bpool.finalize({ from: controller });
    await bpool.setTokenIntOut(process.env.USDT, process.env.EROWAN, { from: controller });
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb(); 
}
