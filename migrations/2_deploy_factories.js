const BFactory = artifacts.require('BFactory');

module.exports = async function (deployer, network, accounts) {
    deployer.deploy(BFactory, '0x724a3f6bad584e7e0edf1204369daf51ec162a35');
};
