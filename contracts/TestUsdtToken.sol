pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract TestRowanToken is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("Test eRowan", "tRWN", 18) {
        _mint(msg.sender, 120000000 * (10**uint256(decimals())));
    }
}
