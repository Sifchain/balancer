pragma solidity 0.5.12;

contract Whitelist {
    mapping (address => bool) private _isWhitelisted;
    uint256 private _whitelist;

    modifier onlyWhitelisted(address _user) {
        require(isWhitelisted(_user) == true, "!on whitelist");
        _;
    }

    function addToWhitelist(address toWhitelist) internal {
        require(_isWhitelisted[toWhitelist] == false, "Already on list");

        _isWhitelisted[toWhitelist] = true;
        _whitelist++;
    }

    function removeFromWhitelist(address toRemove) internal {
        require(_isWhitelisted[toRemove] == true, "Not on list");

        _isWhitelisted[toRemove] = false;
        _whitelist--;
    }

    function totalWhitelisted() public view returns (uint256) {
        return _whitelist;
    }

    function isWhitelisted(address user) public view returns (bool) {
        return _isWhitelisted[user];
    }
}