pragma solidity 0.5.12;

contract Hash {
    mapping (address => mapping(bytes32 => bool)) private _tokenByAddress;
    
    function getHash(string memory _data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_data));
    }
    
    function checkHash(bytes32 _data, string memory _dataString) public pure returns (bool) {
        return uint256(_data) == uint256(getHash(_dataString));
    }
    
    function getToken(address _user, bytes32 _data) public view returns (bool) {
        return _tokenByAddress[_user][_data];
    }
    
    function presentKey(address _user, string memory _data) public view returns (bool) {
        bytes32 hash = getHash(_data);
        return getToken(_user, hash);
    }
    
    function setToken(address _user, bytes32 _data) internal returns (bool) {
        _tokenByAddress[_user][_data] = true;
    }

    function deleteToken(address _user, bytes32 _data) internal returns (bool) {
        _tokenByAddress[_user][_data] = false;
        return true;
    }
}