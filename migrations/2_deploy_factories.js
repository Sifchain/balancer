const BPool = artifacts.require('BPool');
const OwnableWhitelist = artifacts.require('OwnableWhitelist');
const fs = require('fs');
const controller = JSON.parse(fs.readFileSync('../Accounts',"utf8"))['account'];

module.exports = async function (deployer) {
    try {
        await deployer.deploy(OwnableWhitelist);
        await OwnableWhitelist.deployed();
        await deployer.deploy(BPool, OwnableWhitelist.address, controller);
        await BPool.deployed();
        let obj = {
            "abi": BPool.abi,
            "address": BPool.address,
        }
        let data = JSON.stringify(obj);
        fs.writeFileSync('BalancerABI.json', data);
    } catch (error) {
        console.log("Error deploying:::: ", error)   
    }
};