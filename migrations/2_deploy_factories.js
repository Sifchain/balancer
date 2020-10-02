const BFactory = artifacts.require('BFactory');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');

module.exports = async function (deployer) {
    try {
        const whitelist = await deployer.deploy(OwnableWhitelist)
        console.log("whitelist: ", OwnableWhitelist.address)
        await deployer.deploy(BFactory, OwnableWhitelist.address);
    } catch (error) {
        console.log("\n\n\n\n\nError deploying:::: ", error)   
    }
};
