## Support for cross-chain and decentralized atomic swaps on Ethereum and Ethereum based chains

AtomicSwap.sol is deployed to Kovan: https://kovan.etherscan.io/address/0x9f7e5402ed0858ea0c5914d44b900a42c89547b8#code
AtomicTokenSwap.sol is deployed to Kovan: https://kovan.etherscan.io/address/0x7657ca877fac31d20528b473162e39b6e152fd2e#code

StuBucks.sol is deployed to Kovan as a test ERC20 token: https://kovan.etherscan.io/address/0x519e2e07a675362d2f2bfa0f809d70ab8770f0c2#code

Secret generated with Python's new `secrets` module as such:

```
import secrets
s = secret.token_bytes(32)
print(s.hex())
```

Hash lock generated with Python's `hashlib` module:

```
import hashlib
h = hashlib.new('ripemd160')
h.update(s)
hl = h.digest()
print(hl.hex())
```