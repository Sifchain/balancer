const BPool = artifacts.require("BPool");
const poolAddress = BPool.address;

module.exports = function (cb) {
  setGasPriceLimit(cb);
};

async function setGasPriceLimit(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const newGasPriceLimit = process.argv[4];
    const bpool = await BPool.at(poolAddress);
    console.log("Pool address:", poolAddress);
    let setGasPriceLimitTx = await bpool.setGasPriceLimit(
      parseInt(newGasPriceLimit),
      { from: controller }
    );
    console.log("set gas price limit tx:", JSON.stringify(setGasPriceLimitTx));
  } catch (error) {
    console.log("ERROR:", error);
  }
  cb();
}
