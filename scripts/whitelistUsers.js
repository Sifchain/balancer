const OwnableWhitelist = artifacts.require("OwnableWhitelist");

// grab the address of the smart contract account that we are going to whitelist
const whitelist_address = OwnableWhitelist.address;

// set the array of addresses that you would like to whitelist here
const usersToWhitelist = require("./whitelist.json");

module.exports = function (cb) {
  async function bulkwhitelistUsers() {
    try {
      const whitelistAddresses = usersToWhitelist.map(e => {e.address})
      const whitelistHashedKeys = usersToWhitelist.map(e => {e.hashed_key})
      let whitelist = await OwnableWhitelist.at(whitelist_address);
      let res = await whitelist.bulkWhitelistUsers(
        whitelistAddresses, whitelistHashedKeys, {
        from: process.env.WHITE_LIST_MANAGER,
      });

      console.log("tx from bulk whitelisting: " + JSON.stringify(res));
    } catch (error) {
      console.log("ERROR:: ", error);
    }
    cb();
  }
  bulkwhitelistUsers();
};
