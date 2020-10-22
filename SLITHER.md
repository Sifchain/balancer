# Here is the current output from running slither against our BPool contract

BPool.onlyWhitelisted(address) (BPool.sol#146-152) compares to a boolean constant:
	-require(bool,string)(OwnableWhitelist(_whiteListContract).isWhitelisted(_user) == true,ERR_NOT_WHITELISTED) (BPool.sol#147-150)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#boolean-equality
INFO:Detectors:
Event BPoolLOG_SWAP(address,address,address,uint256,uint256) (BPool.sol#103-109) is not in CapWords
Event BPoolLOG_JOIN(address,address,uint256) (BPool.sol#111-115) is not in CapWords
Event BPoolLOG_EXIT(address,address,uint256) (BPool.sol#117-121) is not in CapWords
Event BPoolLOG_CALL(bytes4,address,bytes) (BPool.sol#123-127) is not in CapWords
Modifier BPool._logs_() (BPool.sol#129-132) is not in mixedCase
Modifier BPool._lock_() (BPool.sol#134-139) is not in mixedCase
Modifier BPool._viewlock_() (BPool.sol#141-144) is not in mixedCase
Parameter OwnableWhitelist.isWhitelisted(address)._user (OwnableWhitelist.sol#115) is not in mixedCase
Parameter OwnableWhitelist.whitelistUser(address)._user (OwnableWhitelist.sol#119) is not in mixedCase
Parameter OwnableWhitelist.bulkWhitelistUsers(address[])._users (OwnableWhitelist.sol#124) is not in mixedCase
Parameter OwnableWhitelist.removeWhitelistedUser(address)._user (OwnableWhitelist.sol#133) is not in mixedCase
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformity-to-solidity-naming-conventions
INFO:Detectors:
calcPoolOutGivenSingleIn(uint256,uint256,uint256,uint256,uint256,uint256) should be declared external:
	- BMath.calcPoolOutGivenSingleIn(uint256,uint256,uint256,uint256,uint256,uint256) (BMath.sol#117-144)
calcSingleInGivenPoolOut(uint256,uint256,uint256,uint256,uint256,uint256) should be declared external:
	- BMath.calcSingleInGivenPoolOut(uint256,uint256,uint256,uint256,uint256,uint256) (BMath.sol#156-182)
calcSingleOutGivenPoolIn(uint256,uint256,uint256,uint256,uint256,uint256) should be declared external:
	- BMath.calcSingleOutGivenPoolIn(uint256,uint256,uint256,uint256,uint256,uint256) (BMath.sol#195-224)
calcPoolInGivenSingleOut(uint256,uint256,uint256,uint256,uint256,uint256) should be declared external:
	- BMath.calcPoolInGivenSingleOut(uint256,uint256,uint256,uint256,uint256,uint256) (BMath.sol#237-268)
owner() should be declared external:
	- Ownable.owner() (OwnableWhitelist.sol#19-21)
renounceOwnership() should be declared external:
	- Ownable.renounceOwnership() (OwnableWhitelist.sol#45-48)
transferOwnership(address) should be declared external:
	- Ownable.transferOwnership(address) (OwnableWhitelist.sol#54-56)
isWhitelisted(address) should be declared external:
	- OwnableWhitelist.isWhitelisted(address) (OwnableWhitelist.sol#115-117)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#public-function-that-could-be-declared-external