require('dotenv').config();
const { USDT, EROWAN, NETWORK } = process.env;
const fs = require("fs");

module.exports = function (cb) {
  let obj = {
    usdtAddress: USDT,
    rwnAddress: EROWAN,
    network: NETWORK,
  };
  let data = JSON.stringify(obj);
  fs.writeFileSync(`TokenSaleData.json`, data);
  cb();
};
