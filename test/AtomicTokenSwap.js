const atomicSwap = artifacts.require("./AtomicSwapTest.sol");
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

  afterEach(async () => {
    const instance = await atomicSwap.deployed();

    await instance.clearSwap(hashLock, other);
  });

  it('should not initiate if expiration is in the past', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);

      await instance.initiate(now - 10, hashLock, other, token.address, true, 100);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not initiate if a swap already existst with that lock', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);

      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not initiate if the tokens we're not approved`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it(`should not initiate if a different ammount of tokens we're approved`, async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 50);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should initiate a swap with valid data', async () => {
    const instance = await atomicSwap.deployed();
    const token = await testToken.deployed();
    
    await token.approve(instance.address, 100);
    await instance.initiate(now + day, hashLock, other, token.address, true, 100);
    const {1: initiator, 2: participant, 3: value, 4: isToken, 6: exists} = await instance.swaps(other, hashLock);

    assert.equal(initiator, owner);
    assert.equal(participant, other);
    assert.equal(value, 100);
    assert.equal(isToken, true);
    assert.equal(exists, true);
  });

  it('should not redeem if the secret is invalid', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      
      await instance.redeem("<wrong-secret>", {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not redeem if the sender is not the participant', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      
      await instance.redeem(secret);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not redeem if the swap expired', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      
      await timeTravel(day + 100);
      
      await instance.redeem(secret, {from: other});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should redeem if valid data is provided', async () => {
    const instance = await atomicSwap.deployed();
    const token = await testToken.deployed();
    
    await token.approve(instance.address, 100);
    const beforeBalance = await token.balanceOf(other);

    await instance.initiate(now + day, hashLock, other, token.address, true, 100);
    
    await instance.redeem(secret, {from: other});
    
    const afterBalance = await token.balanceOf(other);

    assert.equal(afterBalance - beforeBalance, 100);
  });

  it('should not refund if swap is still active', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      
      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });
  
  it('should not refund if the sender is not the initiator', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      await timeTravel(day + 100);
      
      await instance.refund(hashLock, other, {from: notInitiator});
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should not refund if the swap was already redeemed', async () => {
    try {
      const instance = await atomicSwap.deployed();
      const token = await testToken.deployed();
      
      await token.approve(instance.address, 100);
      await instance.initiate(now + day, hashLock, other, token.address, true, 100);
      
      await instance.redeem(secret, {from: other});

      await timeTravel(day + 100);
      
      await instance.refund(hashLock, other);
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert');
    }
  });

  it('should refund if valid data is provided', async () => {
    const instance = await atomicSwap.deployed();
    const token = await testToken.deployed();

    const beforeBalance = await token.balanceOf(owner);
    
    await token.approve(instance.address, 100);
    await instance.initiate(now + day, hashLock, other, token.address, true, 100);

    await timeTravel(day + 100);
    await instance.refund(hashLock, other);

    const afterBalance = await token.balanceOf(owner);

    assert.equal(afterBalance - beforeBalance, 0);
  });
});
