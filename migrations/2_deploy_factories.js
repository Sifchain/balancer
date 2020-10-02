const BFactory = artifacts.require('BFactory');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

module.exports = async function (deployer) {
    try {
        await deployer.deploy(OwnableWhitelist)
        await deployer.deploy(BFactory, OwnableWhitelist.address);
    } catch (error) {
        console.log("Error deploying:::: ", error)   
    }
};
