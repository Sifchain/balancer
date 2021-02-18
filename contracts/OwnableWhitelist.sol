pragma solidity 0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract OwnableWhitelist is Ownable {

    constructor() Ownable() public {}

    mapping (address => bytes32) public _tokenByAddress;

    function getToken(address _user) public view returns (bytes32) {
        return _tokenByAddress[_user];
    }

    function validateWhitelistedUserAndKey(address _user, string memory _data) public view returns (bool) {
        return _tokenByAddress[_user] == keccak256(abi.encodePacked(_data));
    }

    function bulkWhitelistUsers(address[] calldata _users, bytes32[] calldata _hashedKeys) external onlyOwner {
        require(_users.length == _hashedKeys.length, "users and hashed keys not equal");
        for (uint256 i = 0; i < _users.length; i++) {
            _tokenByAddress[_users[i]] = _hashedKeys[i];
        }
    }

    function removeWhitelistedUser(address _user) external onlyOwner {
        delete _tokenByAddress[_user];
    }
}
