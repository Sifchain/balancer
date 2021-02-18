pragma solidity 0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/access/Roles.sol";

import "./Hash.sol";

contract OwnableWhitelist is Ownable, Hash {

    event UserAdded(address indexed account);
    event UserRemoved(address indexed account);

    constructor() Ownable() public {}

    function validateWhitelistedUserAndKey(
        address _user,
        string memory _key
    ) public view returns (bool) {
        return presentKey(_user, _key);
    }

    function bulkWhitelistUsers(address[] calldata _users, bytes32[] calldata _hashedKeys) external onlyOwner {
        require(_users.length == _hashedKeys.length, "users and hashed keys not equal");

        for (uint256 i = 0; i < _users.length; i++) {
            address _user = _users[i];
            bytes32 _hash = _hashedKeys[i];

            setToken(_user, _hash);
        }
    }

    function removeWhitelistedUser(address _user, bytes32 _hashedKey) external onlyOwner {
        deleteToken(_user, _hashedKey);
    }
}
