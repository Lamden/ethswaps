const AtomicTokenSwap = artifacts.require("./AtomicTokenSwap.sol");
const AtomicSwap = artifacts.require("./AtomicSwap.sol");
const TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AtomicTokenSwap);
  deployer.deploy(AtomicSwap);
  deployer.deploy(TestToken);
};
