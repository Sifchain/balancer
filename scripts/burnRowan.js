const mockToken = artifacts.require("MockRowanToken.sol");
const { toWei } = web3.utils;

module.exports = function(cb) {
  burnRowan(cb);
};

async function burnRowan(cb) {
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    console.log("Rowan address: " + rowanContract.address);
    const res = await rowanContract.transfer('0x0000000000000000000000000000000000000001', toWei(process.argv[6]));
    console.log('tx transfer: ' + JSON.stringify(res));
  } catch (error) {
      console.log("ERROR:: ", error)
  }
  cb();
}
