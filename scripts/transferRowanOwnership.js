const mockToken = artifacts.require("MockRowanToken.sol");

module.exports = function(cb) {
  transferRowanOwnership(cb);
};

async function transferRowanOwnership(cb) {
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    const newErowanOwner = process.env.NEW_OWNER_EROWAN;
    console.log("Rowan address: " + rowanContract.address);

    const res = await rowanContract.addMinter(newErowanOwner);
    console.log('tx new minter added: ' + JSON.stringify(res));
    const added = await bpool.isMinter(newErowanOwner);
    if(!added) {
      console.log("ERROR:: Rowan owner has not been changed!");
      cb();
    }

    const res = await rowanContract.renounceMinter();
    console.log('tx old minter removed: ' + JSON.stringify(res));
    console.log('New rowan owner address is: ' + newErowanOwner);

  } catch (error) {
      console.log("ERROR:: ", error);
  }
  cb();
}
