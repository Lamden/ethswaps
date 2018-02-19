const atomicSwap = artifacts.require("./AtomicSwap.sol");
const timeTravel = require("./helpers/timeTravel");

const hashLock = "0x7e4872d4d83a8544dd0931f8fa4fe00f67dd4b1a";
const secret = "0x2c89acde3c71b0338c3a2b3c9b0e3686f844e25d6394c14825d0bb9172df344b";

contract("AtomicSwap", (accounts) => {
  const {0: owner, 1: other, 2: notInitiator} = accounts;
  let day = 86400;
  let now;

  beforeEach(() => {
    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
  });

  it('should create a swap', async () => {
    const instance = await atomicSwap.deployed();
    
    await instance.initiate(now + day, hashLock, other, {value: 10e18});

    const {1: initiator, 2: participant, 3: value, 4: exists} = await instance.swaps(other, hashLock);

    assert.equal(initiator, owner);
    assert.equal(participant, other);
    assert.equal(value.valueOf(), 10e18);
    assert.equal(exists, true);
  });

  it('should fail if a swap already exists for that lock', async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.initiate(now + day, hashLock, other, {value: 10e18});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should fail if swap doesn't exist`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.redeem("some-inexistent-secret");
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it (`should fail if the message sender is not the swap participant`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.redeem(secret);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should let you redeem your ether from the swap', async () => {
    const instance = await atomicSwap.deployed();

    const prevBalance = await web3.eth.getBalance(other);

    await instance.redeem(secret, {from: other});
    
    const balance = await web3.eth.getBalance(other);

    const {4: exists} = await instance.swaps(other, hashLock);
  
    assert.equal(balance.sub(prevBalance).valueOf(), 10e18);

    assert.equal(exists, false);
  });

  it(`should not refund if swap doesn't exist for participant`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.refund(hashLock, owner);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund if swap doesn't exist for participant with that hash`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.refund("wrong-hahs-lock", other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund if exipration time was not met`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund if refundee is not the initiator`, async () => {
    try {
      const instance = await atomicSwap.deployed();

      await timeTravel(day);

      await instance.refund(hashLock, other, {from: notInitiator});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should refund if all requirements are met`, async () => {
    const instance = await atomicSwap.deployed();

    const beforeBalance = await web3.eth.getBalance(owner);

    await timeTravel(day);

    await instance.refund(hashLock, other);

    const balance = await web3.eth.getBalance(other);

    assert.equal(balance.sub(beforeBalance).valueOf(), 10e18);
    
  });
});