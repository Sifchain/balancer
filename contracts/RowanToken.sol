pragma solidity ^0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

import "./BalancerTracker.sol";

contract RowanToken is ERC20, Ownable, BalancerTracker {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor (
        string memory name,
        string memory symbol,
        uint8 decimals,
        address bPool
    ) public BalancerTracker(bPool) {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    // Only allow the owner to mint
    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    // Only allow the owner to burn tokens in the balancer pool
    function burn(
        address account,
        uint256 amount
    ) public onlyOwner onlyBalancerPool(account) returns (bool) {
        _burn(account, amount);
        return true;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }
}
