# Ethereum Atomic Swaps
#### Support for cross-chain and decentralized atomic swaps on Ethereum and Ethereum based chains

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

### Real Life Example on Kovan

Alice = 0xabc028d3fdccbc6791812c9bd483feac32d6c42d

Bob = 0x123c0b3d044fee5416f1dc6eae9bf53b8ca692e3

Swap terms: 100 StuBucks for 1 Ether

TX 1: [Alice allows AtomicTokenSwap to spend 100 Stubucks](https://kovan.etherscan.io/tx/0xf14bc94022f9a8f2aaaf99a93e451747398d3c291f547c3d82f783c6caa434b1)

TX 2: [Alice adds a swap to AtomicTokenSwap.](https://kovan.etherscan.io/tx/0x61860c8177bc9b57d8f1e32962209f253b30857a4eb924025b8f77845b51a694)

Expires @ 1518559200, Hash lock = 0x7e4872d4d83a8544dd0931f8fa4fe00f67dd4b1a, Participant = 0x123c0b3d044fee5416f1dc6eae9bf53b8ca692e3, Token = 0x519e2e07a675362d2f2bfa0f809d70ab8770f0c2, Amount = 100000000000000000000 (100^18 because of 18 decimals)

TX 3: Alice shares the transaction hash as proof. [Bob can pull the hash lock from here to build his swap transaction to AtomicSwap.](https://kovan.etherscan.io/tx/0xe89bc468d30d10da93bd503001aeb382682d9985b42d098bc5750ddc9ca3a853)

TX 4. Bob shares the transaction hash as proof. Alice can now interact on AtomicSwap to redeem the Ether. [All she has to do is send the secret to AtomicSwap and the contract will handle the rest](https://kovan.etherscan.io/tx/0x2a7ff4e9e5ef12da9c4229a40a5435bbcfad68b96d2fd227ca1b9d55702c6b56)

Secret = 0x2c89acde3c71b0338c3a2b3c9b0e3686f844e25d6394c14825d0bb9172df344b

TX 5. Now the secret is public. [Bob uses it to get his StuBucks] (https://kovan.etherscan.io/tx/0x4ad5128d51dd902c1dea44da09746827bbadf25edc48d60099bd72eab7792cb6)

The swap is complete!!!
