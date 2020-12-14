const BPool = artifacts.require("BPool");
const pool_address = BPool.address;

module.exports = function(cb) {
  startSales(cb);
};

async function startSales(cb) {
  try {
    const controller = process.env.CONTROLLER;
    const bpool = await BPool.at(pool_address);
    console.log("Pool address: " + pool_address);

    // now finalize
    let res = await bpool.finalize({ from: controller });
    console.log('\n\n\n\n\n\n\ntx Pool finalized: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb();
}
