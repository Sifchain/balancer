pragma solidity ^0.5.12;

/**
 * This is a simple contract to keep track of 
 * the balancer pool address so that we can only
 * burn the eRowan tokens that are locked inside
 * of the balancer pool contract.
 */
 
contract BalancerTracker {
    address private _balancerPool;

    constructor(address bPool) public {
        _balancerPool = bPool;
    }

    function getBalancerPoolAddress() public view returns (address) {
        return _balancerPool;
    }

    modifier onlyBalancerPool(address pool) {
        require(pool == getBalancerPoolAddress(), "!pool");
        _;
    }
}