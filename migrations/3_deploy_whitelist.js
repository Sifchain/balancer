const BPool = artifacts.require('BPool');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');
const fs = require('fs');

module.exports = async function (deployer, network, accounts) {
    try {
        console.log('address : ', accounts[0])
        console.log('address : ', accounts)
        console.log('network : ', network)
        await deployer.deploy(OwnableWhitelist, {from: accounts[0]});
    } catch (error) {
        console.log("Error deploying:::: ", error);
    }
};