const BFactory = artifacts.require('BFactory');

module.exports = async function (deployer, network, accounts) {
    deployer.deploy(BFactory);
};
