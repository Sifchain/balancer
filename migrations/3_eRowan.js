const MockRowanToken = artifacts.require("MockRowanToken");

module.exports = function (deployer) {
  deployer.deploy(MockRowanToken, "eRowan", "RWN", 18);
};
