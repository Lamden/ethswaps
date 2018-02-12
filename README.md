## Support for cross-chain and decentralized atomic swaps on Ethereum and Ethereum based chains

AtomicSwap.sol is deployed to Kovan: https://kovan.etherscan.io/address/0x9f7e5402ed0858ea0c5914d44b900a42c89547b8#code
AtomicTokenSwap.sol is deployed to Kovan: https://kovan.etherscan.io/address/0x7657ca877fac31d20528b473162e39b6e152fd2e#code

StuBucks.sol is deployed to Kovan as a test ERC20 token: https://kovan.etherscan.io/address/0x519e2e07a675362d2f2bfa0f809d70ab8770f0c2#code

Secret generated with Python's new `secrets` module as such:

```
import secrets
s = secret.token_bytes(32)
print(s.hex())

> '439d060b25b6e32be1614caec1331163f1ad64208978d3003ae6055f37fd7198'
```

Hash lock generated with Python's `hashlib` module:

```
import hashlib
h = hashlib.new('ripemd160')
h.update(s)
hl = h.digest()
print(hl.hex())

> 'be1e9b24579b5bcfcaed63c04e785a59681161e5'
```

An atomic swap works like this:

- The terms of the swap are established. In this example, 100 StuBucks for 1 Ether
- Alice generates the secret and sets up a swap on her chain that sends an amount to Bob.
- Alice owns StuBucks, so she sends two transactions.
	1. Allow the AtomicTokenSwap contract to spend 100 StuBucks
	2. Add a swap of 100 StuBucks to Bob if hash(secret) = 'be1e9b24579b5bcfcaed63c04e785a59681161e5' that expires in 24 hours
- Alice then sends Bob the Hash Lock
- Bob then creates a transaction on the AtomicSwap contract:
	1. Add a swap of 1 Ether to Alice if hash(secret) = 'be1e9b24579b5bcfcaed63c04e785a59681161e5' that expires in 24 hours
- Let's assume Bob made it for 0.5 Ether instead. Well... Alice can use the Hash Lock and the blockchain to confirm that Bob is a cheat. All she has to do now is wait for the swap to expire and she gets her tokens back.
- Alice *only* sends the secret when she verifies that Bob is legit.
- Let's assume Alice made the transaction for 50 StuBucks instead. Well... Bob makes the transaction second, so he doesn't have to make the transaction until he confirms that Alice is legit!

Thus, trustless decentralized swaps.