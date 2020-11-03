pragma solidity 0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/access/Roles.sol";

import "./Hash.sol";

contract OwnableWhitelist is Ownable, Hash {
    using Roles for Roles.Role;

    event UserAdded(address indexed account);
    event UserRemoved(address indexed account);

    Roles.Role private _whitelist;

    constructor() Ownable() public {
        _whitelist.add(msg.sender);
    }

    function isWhitelisted(address _user) public view returns (bool) {
        return _whitelist.has(_user);
    }

    function validateWhitelistedUserAndKey(
        address _user,
        string memory _key
    ) public view returns (bool) {
        return isWhitelisted(_user) && presentKey(_user, _key);
    }

    function whitelistUser(address _user, bytes32 _hashedValue) external onlyOwner {
        _whitelist.add(_user);
        setToken(_user, _hashedValue);
        emit UserAdded(_user);
    }

    function bulkWhitelistUsers(address[] calldata _users, bytes32[] calldata _hashedKeys) external onlyOwner {
        require(_users.length == _hashedKeys.length, "users and hashed keys not equal");

        for (uint256 i = 0; i < _users.length; i++) {
            address _user = _users[i];
            bytes32 _hash = _hashedKeys[i];

            _whitelist.add(_user);
            setToken(_user, _hash);
            emit UserAdded(_user);
        }
    }

    function removeWhitelistedUser(address _user, bytes32 _hashedKey) external onlyOwner {
        _whitelist.remove(_user);
        deleteToken(_user, _hashedKey);
        emit UserRemoved(_user);
    }
}
