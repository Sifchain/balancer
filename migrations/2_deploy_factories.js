const BPool = artifacts.require('BPool');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

module.exports = async function (deployer) {
    try {
        await deployer.deploy(OwnableWhitelist);
        await deployer.deploy(BPool, OwnableWhitelist.address);
    } catch (error) {
        console.log("Error deploying:::: ", error);
    }
};
