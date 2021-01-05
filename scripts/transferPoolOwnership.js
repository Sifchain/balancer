const BPool = artifacts.require("BPool");
const poolAddress = BPool.address;

module.exports = function(cb) {
  transferOwnership(cb);
};

async function transferOwnership(cb) {
  try {
    const controller = process.env.CONTROLLER;
    let newController = process.env.NEW_CONTROLLER;
    const bpool = await BPool.at(poolAddress);
    console.log("Pool address:", poolAddress);
    const res = await bpool.setController(newController, { from: controller });
    console.log('\nset controller tx:', JSON.stringify(res));
    newController = await bpool.getController();
    console.log("\nNew controller address is:", newController);
  } catch (error) {
    console.log("ERROR:", error)
  }
  cb();
}
