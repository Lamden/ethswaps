const atomicTokenSwap = artifacts.require("./AtomicTokenSwap.sol");
const testToken = artifacts.require("./TestToken.sol");
const timeTravel = require("./helpers/timeTravel");

const hashLock = "0x7e4872d4d83a8544dd0931f8fa4fe00f67dd4b1a";
const secret = "0x2c89acde3c71b0338c3a2b3c9b0e3686f844e25d6394c14825d0bb9172df344b";

contract("AtomicTokenSwap", (accounts) => {
  const {0: owner, 1: other, 2: notInitiator} = accounts;
  let day = 86400;
  let now;

  beforeEach(() => {
    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
  });

  it('should fail to initiate if token transfer was not authorized', async () => {
    const instance = await atomicTokenSwap.deployed();
    const token = await testToken.deployed();

    try {
      await instance.initiate(now, hashLock, other, token.address, 10e19);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  })

  it('should initiate a swap if token transfer was authoirzed', async () => {
    const instance = await atomicTokenSwap.deployed();
    const token = await testToken.deployed();
  
    await token.approve(instance.address, 100);

    await instance.initiate(now, hashLock, other, token.address, 100);

    const {1: initiator, 2: participant, 4: value, 5: exists} = await instance.swaps(other, hashLock);

    assert.equal(initiator, owner);
    assert.equal(participant, other);
    assert.equal(value, 100);
    assert.equal(exists, true);
  });

  it(`should fail to initiate given there's already a swap with the same hash lock`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      const token = await testToken.deployed();
    
      await token.approve(instance.address, 100);

      await instance.initiate(now, hashLock, other, token.address, 100);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should fail to redeem if swap doesn't exist`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await instance.redeem("some-inexistent-secret");
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it (`should fail to redeem if the message sender is not the swap participant`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await instance.redeem(secret);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should fail to redeem if swap was already redeemed or refunded', async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      const token = await testToken.deployed();

      await instance.refund(hashLock, other);

      await token.approve(instance.address, 100);
    
      await instance.initiate(now + 10, hashLock, other, token.address, 100);

      await instance.redeem(secret, {from: other});

      await instance.redeem(secret, {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it ('should fail to redeem if swap expired', async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      
      await instance.initiate(now, hashLock, other, token.address, 100);
      
      await timeTravel(day);
      await timeTravel(day);

      await instance.redeem(secret, {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should let you redeem your tokens from the swap', async () => {
    const instance = await atomicTokenSwap.deployed();
    const token = await testToken.deployed();
    // refund expired swap from previous test
    await instance.refund(hashLock, other);
    
    const beforeBalance = await token.balanceOf(other);
    //approve and initiate new swap
    await token.approve(instance.address, 100);
    
    await instance.initiate(now + 10, hashLock, other, token.address, 100);

    await instance.redeem(secret, {from: other});

    const balance = await token.balanceOf(other);
    const {5: exists} = await instance.swaps(other, hashLock);

    assert.equal(balance.sub(beforeBalance).toNumber(), 100);
    assert.equal(exists, false);
  });

  it(`should not refund if swap doesn't exist for participant`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await instance.refund(hashLock, owner);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund with invalid swap secret`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await instance.refund("wrong-hash-lock", other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund if exipration time was not met`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not refund if swap already redeemed or refunded', async () => {
    try {
      const instance = await atomicTokenSwap.deployed();
      await timeTravel(day);
      await instance.refund(hashLock, other);
      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not refund if refundee is not the initiator`, async () => {
    try {
      const instance = await atomicTokenSwap.deployed();

      await timeTravel(day);

      await instance.refund(hashLock, other, {from: notInitiator});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should refund if all requirements are met`, async () => {
    const instance = await atomicTokenSwap.deployed();
    const token = await testToken.deployed();

    const beforeBalance = await token.balanceOf(owner);

    //approve and initiate new swap
    await token.approve(instance.address, 100);
    
    await instance.initiate(now, hashLock, other, token.address, 100);

    await timeTravel(day);

    await instance.refund(hashLock, other);

    const balance = await token.balanceOf(owner);

    assert.equal(balance.toNumber(), beforeBalance.toNumber() + 100);
  });
});
