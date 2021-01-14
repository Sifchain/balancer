// Only deploy this mock token locally
const MockRowanToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;

module.exports = async function (deployer) {
  await deployer.deploy(MockRowanToken, "erowan", "erowan", 18);
  const eRowanContract = await MockRowanToken.deployed();
  const controller = process.env.CONTROLLER;
  await eRowanContract.mint(controller, toWei("70000000"));
};
