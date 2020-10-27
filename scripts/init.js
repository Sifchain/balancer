const BPool = artifacts.require("BPool");
const pool_address = BPool.address;

module.exports = function(cb) {
  init(cb);
}

async function init(cb) {
    try {
      const controller = process.env.CONTROLLER;
      const bpool = await BPool.at(pool_address);

      } catch (error) {
          console.log("ERROR:: ", error);
      }
    cb();
}
