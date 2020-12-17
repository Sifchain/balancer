const mockToken = artifacts.require("MockRowanToken.sol");

module.exports = function(cb) {
  transferRowanOwnership(cb);
};

async function transferRowanOwnership(cb) {
  try {
    const rowanContract = await mockToken.at(process.env.EROWAN);
    const newErowanOwner = process.env.NEW_OWNER_EROWAN;
    console.log("Rowan address: " + rowanContract.address);

    let res = await rowanContract.addMinter(newErowanOwner);
    console.log('tx new minter added: ' + JSON.stringify(res));
    const added = await rowanContract.isMinter(newErowanOwner);
    if(!added) {
      console.log("ERROR:: Rowan owner has not been changed!");
      cb();
      return;
    }

    res = await rowanContract.renounceMinter();
    console.log('\n\n\n\n\n\n\ntx old minter removed: ' + JSON.stringify(res));
    console.log('New rowan owner address has been set to: ' + newErowanOwner);

  } catch (error) {
      console.log("ERROR:: ", error);
  }
  cb();
}
