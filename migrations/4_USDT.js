const MockUSDTToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;

module.exports = async function (deployer) {
  await deployer.deploy(MockUSDTToken, "USDT Stablecoin", "USDT", 6);
  const usdtContract = await MockUSDTToken.deployed();
  const controller = process.env.CONTROLLER;
  await usdtContract.transferOwnership(controller);
  await usdtContract.mint(controller, toWei("45000", "mwei"), {from: controller});
};
