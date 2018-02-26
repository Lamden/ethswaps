const AtomicSwapTest = artifacts.require("./AtomicSwapTest.sol");
const AtomicSwap = artifacts.require("./AtomicSwap.sol");
const TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AtomicSwapTest);
  deployer.deploy(AtomicSwap);
  deployer.deploy(TestToken);
};
