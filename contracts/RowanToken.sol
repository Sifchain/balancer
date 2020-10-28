pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RowanToken is ERC20 {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor (string memory name, string memory symbol, uint8 decimals) public {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
        uint256 totalTokenSupply = 120000000 * (10**uint256(decimals));
        // The person who creates this contract gets all 120,000,000 tokens
        _mint(msg.sender, totalTokenSupply);
    }
}
