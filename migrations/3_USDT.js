// Only deploy this mock token locally
const MockUSDTToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;
const fs = require("fs");

module.exports = async function (deployer) {
  await deployer.deploy(MockUSDTToken, "USDT Stablecoin", "USDT", 6);
  const usdtContract = await MockUSDTToken.deployed();
  const controller = process.env.CONTROLLER;
  await usdtContract.mint(controller, toWei("46000", "mwei"));
};
