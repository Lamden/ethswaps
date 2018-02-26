const atomicSwap = artifacts.require("./AtomicSwapTest.sol");
const timeTravel = require("./helpers/timeTravel");

const hashLock = "0x7e4872d4d83a8544dd0931f8fa4fe00f67dd4b1a";
const secret = "0x2c89acde3c71b0338c3a2b3c9b0e3686f844e25d6394c14825d0bb9172df344b";

contract("Ether Atomic Swaps", (accounts) => {
  const {0: owner, 1: other, 2: notInitiator} = accounts;
  let day = 86400;
  let now;

  beforeEach(() => {
    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
  });

  afterEach(async () => {
    const instance = await atomicSwap.deployed();

    await instance.clearSwap(hashLock, other);
  });

  it('should not initiate a swap if the expiration is in the past', async () => {
    try {
      const instance = await atomicSwap.deployed();

      await instance.initiate(now - 10, hashLock, other, 0x0, false, 0, {value: 1e5});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should initiate a swap with valid data', async () => {
    const instance = await atomicSwap.deployed();
    await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
    const {1: initiator, 2: participant, 3: value, 4: isToken, 6: exists} = await instance.swaps(other, hashLock);

    assert.equal(initiator, owner);
    assert.equal(participant, other);
    assert.equal(value.valueOf(), 1e5);
    assert.equal(isToken, false);
    assert.equal(exists, true);
  });

  it('should not initiate a swap when one already exists', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not redeem if the secret is invalid', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
      
      await instance.redeem("<the-wrong-secret>", {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not redeem if the sender is not the participant', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
      
      await instance.redeem(secret, {from: notInitiator});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not redeem if the swap expired', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});
      
      await timeTravel(day + 100);

      await instance.redeem(secret, {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should redeem if all data is valid', async () => {
    const instance = await atomicSwap.deployed();

    const beforeBalance = await web3.eth.getBalance(other);

    await instance.initiate(now + 10, hashLock, other, 0x0, false, 0, {value: web3.toWei(1, "ether")});

    await instance.redeem(secret, {from: other});

    const afterBalance = await web3.eth.getBalance(other);

    assert.equal(Math.ceil(web3.fromWei(afterBalance.sub(beforeBalance), 'ether')), 1);
  });

  it('should not refund if swap did not expire', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});

      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not refund if the sender is not the initiator', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});

      await instance.refund(hashLock, other, {from: notInitiator});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not refund if the swap is not valid', async () => {
    try {
      const instance = await atomicSwap.deployed();
      
      await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: 1e5});

      await instance.redeem(secret, {from: other});

      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should refund if all data is valid', async () => {
    const instance = await atomicSwap.deployed();
    
    await instance.initiate(now + day, hashLock, other, 0x0, false, 0, {value: web3.toWei(1, 'ether')});

    const beforeBalance = await web3.eth.getBalance(owner);

    await timeTravel(day + 100);

    await instance.refund(hashLock, other);

    const afterBalance = await web3.eth.getBalance(owner);

    assert.equal(Math.ceil(web3.fromWei(afterBalance.sub(beforeBalance), 'ether')), 1);
  });
});