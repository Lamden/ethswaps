pragma solidity ^0.4.19;

import "./AtomicSwap.sol";

contract AtomicSwapTest is AtomicSwap {
  
  function clearSwap(bytes20 _hash, address _participant) public {
    Swap storage s = swaps[_participant][_hash];

    if (s.exists) {
      s.exists = false;
    }
  }
}