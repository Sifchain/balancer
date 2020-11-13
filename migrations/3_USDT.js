// Only deploy this mock token locally
const MockUSDTToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;

module.exports = async function (deployer) {
  await deployer.deploy(MockUSDTToken, "USDT Stablecoin", "USDT", 6);
  const usdtContract = await MockUSDTToken.deployed();
  const controller = process.env.CONTROLLER;
  await usdtContract.mint(controller, toWei("46000", "mwei"));
  await usdtContract.mint("0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0", toWei("50000000", "mwei"));
};
