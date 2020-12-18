// Only deploy this mock token locally
const MockRowanToken = artifacts.require("MockRowanToken");
const { toWei } = web3.utils;

module.exports = async function (deployer) {
  await deployer.deploy(MockRowanToken, "erowan", "erowan", 18);
  const eRowanContract = await MockRowanToken.deployed();
  const controller = process.env.CONTROLLER;
  // Mint 8.75m to the initial controller because this is what we need for the initial swap into the pool.
  // After that the ownership will be transfered to controller based on Openzeppelin Defender Relayer
  // and the rest of tokens will be minted to it to be able to add liquidity every hour.
  // Minting 70m to this controller will result in 61.25m of unused erowan.
  await eRowanContract.mint(controller, toWei("8750000"));
};
