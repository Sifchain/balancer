// Only deploy this mock token locally
const MockUSDTToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;

module.exports = async function (deployer) {
  await deployer.deploy(MockUSDTToken, "USDT Stablecoin", "USDT", 6);
  const usdtContract = await MockUSDTToken.deployed();
  const controller = process.env.CONTROLLER;
  const user = process.env.USER_ACCOUNT;
  await usdtContract.mint(controller, toWei("46000", "mwei"));
  await usdtContract.mint(user, toWei("50000000", "mwei"));
};
