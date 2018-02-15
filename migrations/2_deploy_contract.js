var AtomicTokenSwap = artifacts.require("./AtomicTokenSwap.sol");

module.exports = function(deployer) {
  deployer.deploy(AtomicTokenSwap);
};
