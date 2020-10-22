# Here is the current output from running slither against our contracts

## BPool contract:
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

## OwnableWhitelist Contract:

Parameter OwnableWhitelist.isWhitelisted(address)._user (OwnableWhitelist.sol#115) is not in mixedCase
Parameter OwnableWhitelist.whitelistUser(address)._user (OwnableWhitelist.sol#119) is not in mixedCase
Parameter OwnableWhitelist.bulkWhitelistUsers(address[])._users (OwnableWhitelist.sol#124) is not in mixedCase
Parameter OwnableWhitelist.removeWhitelistedUser(address)._user (OwnableWhitelist.sol#133) is not in mixedCase
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformity-to-solidity-naming-conventions
INFO:Detectors:
owner() should be declared external:
	- Ownable.owner() (OwnableWhitelist.sol#19-21)
renounceOwnership() should be declared external:
	- Ownable.renounceOwnership() (OwnableWhitelist.sol#45-48)
transferOwnership(address) should be declared external:
	- Ownable.transferOwnership(address) (OwnableWhitelist.sol#54-56)
isWhitelisted(address) should be declared external:
	- OwnableWhitelist.isWhitelisted(address) (OwnableWhitelist.sol#115-117)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#public-function-that-could-be-declared-external
INFO:Slither:OwnableWhitelist.sol analyzed (3 contracts with 46 detectors), 8 result(s) found

## Final Token: (note that this is not the token implementation we are going to use for eRowan)

INFO:Detectors:
RowanToken.constructor(string,string,uint8).name (FinalToken.sol#416) shadows:
	- RowanToken.name() (FinalToken.sol#425-427) (function)
RowanToken.constructor(string,string,uint8).symbol (FinalToken.sol#416) shadows:
	- RowanToken.symbol() (FinalToken.sol#429-431) (function)
RowanToken.constructor(string,string,uint8).decimals (FinalToken.sol#416) shadows:
	- RowanToken.decimals() (FinalToken.sol#433-435) (function)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#local-variable-shadowing
INFO:Detectors:
RowanToken.constructor(string,string,uint8) (FinalToken.sol#416-423) uses literals with too many digits:
	- totalTokenSupply = 120000000 * (10 ** uint256(decimals)) (FinalToken.sol#420)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#too-many-digits
INFO:Detectors:
totalSupply() should be declared external:
	- ERC20.totalSupply() (FinalToken.sol#221-223)
balanceOf(address) should be declared external:
	- ERC20.balanceOf(address) (FinalToken.sol#228-230)
transfer(address,uint256) should be declared external:
	- ERC20.transfer(address,uint256) (FinalToken.sol#240-243)
allowance(address,address) should be declared external:
	- ERC20.allowance(address,address) (FinalToken.sol#248-250)
approve(address,uint256) should be declared external:
	- ERC20.approve(address,uint256) (FinalToken.sol#259-262)
transferFrom(address,address,uint256) should be declared external:
	- ERC20.transferFrom(address,address,uint256) (FinalToken.sol#276-280)
increaseAllowance(address,uint256) should be declared external:
	- ERC20.increaseAllowance(address,uint256) (FinalToken.sol#294-297)
decreaseAllowance(address,uint256) should be declared external:
	- ERC20.decreaseAllowance(address,uint256) (FinalToken.sol#313-316)
name() should be declared external:
	- RowanToken.name() (FinalToken.sol#425-427)
symbol() should be declared external:
	- RowanToken.symbol() (FinalToken.sol#429-431)
decimals() should be declared external:
	- RowanToken.decimals() (FinalToken.sol#433-435)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#public-function-that-could-be-declared-external
INFO:Slither:FinalToken.sol analyzed (4 contracts with 46 detectors), 15 result(s) found
