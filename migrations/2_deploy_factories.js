const BPool = artifacts.require("BPool");
const OwnableWhitelist = artifacts.require("OwnableWhitelist");
const TestRowanToken = artifacts.require("TestRowanToken");
const TestUsdtToken = artifacts.require("TestUsdtToken");
const fs = require("fs");

module.exports = async function (deployer, networkName) {
  try {
    await deployer.deploy(TestRowanToken);
    const rowanContract = await TestRowanToken.deployed();
    let rowan = {
      abi: rowanContract.abi,
      address: rowanContract.address,
    };
    let rowanData = JSON.stringify(rowan);
    fs.writeFileSync("TestRowanTokenABI.json", rowanData);

    await deployer.deploy(TestUsdtToken);
    const usdtContract = await TestUsdtToken.deployed();
    let usdt = {
      abi: usdtContract.abi,
      address: usdtContract.address,
    };
    let usdtData = JSON.stringify(usdt);
    fs.writeFileSync("TestUsdtTokenABI.json", usdtData);

    await deployer.deploy(OwnableWhitelist);
    const whiteListContract = await OwnableWhitelist.deployed();
    await whiteListContract.transferOwnership(process.env.WHITE_LIST_MANAGER);
    await deployer.deploy(
      BPool,
      whiteListContract.address,
      process.env.CONTROLLER
    );
    const poolContract = await BPool.deployed();
    let obj = {
      abi: poolContract.abi,
      address: poolContract.address,
    };
    let data = JSON.stringify(obj);
    fs.writeFileSync("BalancerABI."+networkName+".json", data);
  } catch (error) {
    console.log("Error deploying:::: ", error);
  }
};
