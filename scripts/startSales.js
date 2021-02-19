const BPool = artifacts.require("BPool");
const poolAddress = BPool.address;

module.exports = function (cb) {
  startSales(cb);
};

async function startSales(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const bpool = await BPool.at(poolAddress);
    console.log("Pool address:", poolAddress);
    let finalizePoolTx = await bpool.finalize({ from: controller });
    console.log("finalize pool tx:", JSON.stringify(finalizePoolTx));
  } catch (error) {
    console.log("ERROR:", error);
  }
  cb();
}
