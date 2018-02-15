const atomicTokenSwap = artifacts.require("./AtomicTokenSwap.sol");
const assertFail = require('./helpers/assertFail');

contract("AtomicTokenSwap", (accounts) => {
  const {0: owner, 1: other} = accounts;
  let day = 86400;
  let now;

  beforeEach(() => {
    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
  });

  it('should initialize a swap', async () => {
    const instance = await atomicTokenSwap.deployed();
  });
});
