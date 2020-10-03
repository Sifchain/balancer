pragma solidity 0.5.12;

//import "./Ownable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/access/Roles.sol";

// import "./Whitelist.sol";

contract OwnableWhitelist is Ownable {
    using Roles for Roles.Role;

    event UserAdded(address indexed account);
    event UserRemoved(address indexed account);

    Roles.Role private _whitelist;
    
    constructor() Ownable() public {
        _whitelist.add(msg.sender);
    }

    function isWhitelisted(address user) public view returns (bool) {
        return _whitelist.has(user);
    }

    function whitelistUser(address _user) external onlyOwner {
        _whitelist.add(_user);
        emit UserAdded(_user);
    }

    function removeWhitelistedUser(address _user) external onlyOwner {
        _whitelist.remove(_user);
        emit UserRemoved(_user);
    }
}