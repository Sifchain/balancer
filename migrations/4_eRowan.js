// Only deploy this mock token locally
const MockRowanToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;
const fs = require("fs");

module.exports = async function (deployer) {
  await deployer.deploy(MockRowanToken, "eRowan", "RWN", 18);
  const eRowanContract = await MockRowanToken.deployed();
  const controller = process.env.CONTROLLER;
  await eRowanContract.mint(controller, toWei("120000000"));

  let rowan = {
    abi: eRowanContract.abi,
    address: eRowanContract.address,
  };
  let rowanData = JSON.stringify(rowan);
};
