pragma solidity 0.5.12;

import "./Ownable.sol";
import "./Whitelist.sol";

contract OwnableWhitelist is Ownable, Whitelist {
    constructor() Ownable() public {
        addToWhitelist(msg.sender);
    }

    function whitelistUser(address _user) external onlyOwner {
        addToWhitelist(_user); 
    }
    
    function removeWhitelistedUser(address _user) external onlyOwner {
        removeFromWhitelist(_user); 
    }
}