pragma solidity ^0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract RowanToken is ERC20, Ownable {
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor (string memory name, string memory symbol, uint8 decimals) public {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    // Only allow the owner to mint
    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        require(amount > 0, "ERR_LOW_MINT_AMOUNT");
        _mint(account, amount);
        return true;
    }

    // Only allow the owner to burn
    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        require(amount > 0, "ERR_LOW_BURN_AMOUNT");
        require(balanceOf(account) >= amount, "ERR_INSUFFICIENT_BAL");
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

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(amount != 0);
        require(balanceOf(msg.sender) >= amount, "ERR_INSUFFICIENT_BAL");
        _transfer(msg.sender, recipient, amount);
        return true;
    }
}
