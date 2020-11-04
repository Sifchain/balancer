const BPool = artifacts.require("BPool");
const OwnableWhitelist = artifacts.require("OwnableWhitelist");
const fs = require("fs");

module.exports = async function (deployer, networkName) {
  try {
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
    fs.writeFileSync(`BalancerABI.${networkName}.json`, data);
  } catch (error) {
    console.log("Error deploying:::: ", error);
  }
};
