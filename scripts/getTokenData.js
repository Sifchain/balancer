require('dotenv').config();
const { USDT, EROWAN } = process.env;
const fs = require("fs");

module.exports = function (cb) {
  let obj = {
    usdtAddress: USDT,
    rowanAddress: EROWAN,
  };
  let data = JSON.stringify(obj);
  fs.writeFileSync(`TokenData.json`, data);
  cb();
};
