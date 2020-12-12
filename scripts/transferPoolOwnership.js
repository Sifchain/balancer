const BPool = artifacts.require("BPool");
const pool_address = BPool.address;

module.exports = function(cb) {
    transferOwnership(cb);
};

async function transferOwnership(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const new_controller = process.env.NEW_CONTROLLER;

    const bpool = await BPool.at(pool_address);
    console.log("Pool address: " + pool_address);

    res = await bpool.setController(new_controller, { from: controller });
    console.log('\n\n\n\n\n\n\ntx Ownership transferred: ' + JSON.stringify(res));
    newController = await bpool.getController();
    console.log('New controller address is: ' + newController);
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb();
}
