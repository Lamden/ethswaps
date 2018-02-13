pragma solidity ^0.4.19;

contract AtomicSwap {
    struct Swap {
        uint expiration;
        address initiator;
        address participant;
        uint256 value;
        bool exists;
    }

    // maps the redeemer and bytes20 hash to a swap    
    mapping(address => mapping(bytes20 => Swap)) public swaps;
    
    // creates a new swap
    function initiate(uint _expiration, bytes20 _hash, address _participant) payable public {
        Swap storage s = swaps[_participant][_hash];
        
        // make sure you aren't overwriting a pre-existing swap
        // (so the original initiator can't rewrite the terms)
        require(s.exists == false);
        swaps[_participant][_hash] = Swap(_expiration, msg.sender, _participant, msg.value, true);
    }
    
    function redeem(bytes32 _secret) public {
        // get a swap from the mapping. we can do it directly because there is no way to 
        // fake the secret.
        bytes20 hash = ripemd160(_secret);
        Swap storage s = swaps[msg.sender][hash];
        
        // make sure it's the right sender
        require(msg.sender == s.participant);
        
        // clean up and send
        s.exists = false;
        msg.sender.transfer(s.value);
    }
    
    function refund(bytes20 _hash, address _participant) public {
        Swap storage s = swaps[_participant][_hash];
        require(now > s.expiration);
        require(msg.sender == s.initiator);
        
        s.exists = false;
        msg.sender.transfer(s.value);
    }
}