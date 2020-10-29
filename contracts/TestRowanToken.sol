pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract TestUsdtToken is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("Test Tether USD", "tUSDT", 6) {
        _mint(msg.sender, 45000 * (10**uint256(decimals())));
    }
}
