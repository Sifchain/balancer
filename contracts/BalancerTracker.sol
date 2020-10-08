pragma solidity ^0.5.12;

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