INFO:Detectors:[92m
MockRowanToken.constructor(string,string,uint8).name (Mocks/MockRowanToken.sol#13) shadows:
	- ERC20Detailed.name() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#27-29) (function)
MockRowanToken.constructor(string,string,uint8).symbol (Mocks/MockRowanToken.sol#13) shadows:
	- ERC20Detailed.symbol() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#35-37) (function)
MockRowanToken.constructor(string,string,uint8).decimals (Mocks/MockRowanToken.sol#13) shadows:
	- ERC20Detailed.decimals() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#51-53) (function)
ERC20Detailed.constructor(string,string,uint8).name (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#18) shadows:
	- ERC20Detailed.name() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#27-29) (function)
ERC20Detailed.constructor(string,string,uint8).symbol (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#18) shadows:
	- ERC20Detailed.symbol() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#35-37) (function)
ERC20Detailed.constructor(string,string,uint8).decimals (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#18) shadows:
	- ERC20Detailed.decimals() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#51-53) (function)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#local-variable-shadowing[0m
INFO:Detectors:[92m
Different versions of Solidity is used in :
	- Version used: ['0.5.12', '^0.5.0']
	- 0.5.12 (BMath.sol#14)
	- ^0.5.0 (@openzeppelin/contracts/math/SafeMath.sol#1)
	- ^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20.sol#1)
	- 0.5.12 (Hash.sol#1)
	- 0.5.12 (BConst.sol#14)
	- ^0.5.0 (@openzeppelin/contracts/access/roles/MinterRole.sol#1)
	- 0.5.12 (BNum.sol#14)
	- ^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol#1)
	- ^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol#1)
	- ^0.5.0 (@openzeppelin/contracts/access/Roles.sol#1)
	- 0.5.12 (Mocks/MockRowanToken.sol#1)
	- 0.5.12 (OwnableWhitelist.sol#1)
	- ^0.5.0 (@openzeppelin/contracts/ownership/Ownable.sol#1)
	- 0.5.12 (BPool.sol#14)
	- ^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#1)
	- ^0.5.0 (@openzeppelin/contracts/token/ERC20/IERC20.sol#1)
	- 0.5.12 (Migrations.sol#1)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#different-pragma-directives-are-used[0m
INFO:Detectors:[92m
Pragma version^0.5.0 (@openzeppelin/contracts/math/SafeMath.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/access/roles/MinterRole.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/access/Roles.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/ownership/Ownable.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#1) allows old versions
Pragma version^0.5.0 (@openzeppelin/contracts/token/ERC20/IERC20.sol#1) allows old versions
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity[0m
INFO:Detectors:[92m
Parameter Hash.getHash(string)._data (Hash.sol#6) is not in mixedCase
Parameter Hash.checkHash(bytes32,string)._data (Hash.sol#10) is not in mixedCase
Parameter Hash.checkHash(bytes32,string)._dataString (Hash.sol#10) is not in mixedCase
Parameter Hash.getToken(address,bytes32)._user (Hash.sol#14) is not in mixedCase
Parameter Hash.getToken(address,bytes32)._data (Hash.sol#14) is not in mixedCase
Parameter Hash.presentKey(address,string)._user (Hash.sol#18) is not in mixedCase
Parameter Hash.presentKey(address,string)._data (Hash.sol#18) is not in mixedCase
Parameter Hash.setToken(address,bytes32)._user (Hash.sol#23) is not in mixedCase
Parameter Hash.setToken(address,bytes32)._data (Hash.sol#23) is not in mixedCase
Parameter Hash.deleteToken(address,bytes32)._user (Hash.sol#27) is not in mixedCase
Parameter Hash.deleteToken(address,bytes32)._data (Hash.sol#27) is not in mixedCase
Parameter OwnableWhitelist.isWhitelisted(address)._user (OwnableWhitelist.sol#20) is not in mixedCase
Parameter OwnableWhitelist.validateWhitelistedUserAndKey(address,string)._user (OwnableWhitelist.sol#25) is not in mixedCase
Parameter OwnableWhitelist.validateWhitelistedUserAndKey(address,string)._key (OwnableWhitelist.sol#26) is not in mixedCase
Parameter OwnableWhitelist.whitelistUser(address,bytes32)._user (OwnableWhitelist.sol#31) is not in mixedCase
Parameter OwnableWhitelist.whitelistUser(address,bytes32)._hashedValue (OwnableWhitelist.sol#31) is not in mixedCase
Parameter OwnableWhitelist.bulkWhitelistUsers(address[],bytes32[])._users (OwnableWhitelist.sol#37) is not in mixedCase
Parameter OwnableWhitelist.bulkWhitelistUsers(address[],bytes32[])._hashedKeys (OwnableWhitelist.sol#37) is not in mixedCase
Parameter OwnableWhitelist.removeWhitelistedUser(address,bytes32)._user (OwnableWhitelist.sol#50) is not in mixedCase
Parameter OwnableWhitelist.removeWhitelistedUser(address,bytes32)._hashedKey (OwnableWhitelist.sol#50) is not in mixedCase
Event BPoolLOG_SWAP(address,address,address,uint256,uint256) (BPool.sol#22-28) is not in CapWords
Event BPoolLOG_JOIN(address,address,uint256) (BPool.sol#30-34) is not in CapWords
Event BPoolLOG_EXIT(address,address,uint256) (BPool.sol#36-40) is not in CapWords
Event BPoolLOG_CALL(bytes4,address,bytes) (BPool.sol#42-46) is not in CapWords
Parameter BPool.swapExactAmountOut(uint256,uint256,uint256,string)._key (BPool.sol#356) is not in mixedCase
Parameter BPool.swapExactAmountIn(uint256,uint256,uint256,string)._key (BPool.sol#417) is not in mixedCase
Modifier BPool._logs_() (BPool.sol#48-51) is not in mixedCase
Modifier BPool._lock_() (BPool.sol#53-58) is not in mixedCase
Modifier BPool._viewlock_() (BPool.sol#60-63) is not in mixedCase
Parameter Migrations.upgrade(address).new_address (Migrations.sol#19) is not in mixedCase
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformity-to-solidity-naming-conventions[0m
INFO:Detectors:[92m
totalSupply() should be declared external:
	- ERC20.totalSupply() (@openzeppelin/contracts/token/ERC20/ERC20.sol#41-43)
balanceOf(address) should be declared external:
	- ERC20.balanceOf(address) (@openzeppelin/contracts/token/ERC20/ERC20.sol#48-50)
transfer(address,uint256) should be declared external:
	- ERC20.transfer(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20.sol#60-63)
allowance(address,address) should be declared external:
	- ERC20.allowance(address,address) (@openzeppelin/contracts/token/ERC20/ERC20.sol#68-70)
approve(address,uint256) should be declared external:
	- ERC20.approve(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20.sol#79-82)
transferFrom(address,address,uint256) should be declared external:
	- ERC20.transferFrom(address,address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20.sol#96-100)
increaseAllowance(address,uint256) should be declared external:
	- ERC20.increaseAllowance(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20.sol#114-117)
decreaseAllowance(address,uint256) should be declared external:
	- ERC20.decreaseAllowance(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20.sol#133-136)
checkHash(bytes32,string) should be declared external:
	- Hash.checkHash(bytes32,string) (Hash.sol#10-12)
addMinter(address) should be declared external:
	- MinterRole.addMinter(address) (@openzeppelin/contracts/access/roles/MinterRole.sol#26-28)
renounceMinter() should be declared external:
	- MinterRole.renounceMinter() (@openzeppelin/contracts/access/roles/MinterRole.sol#30-32)
burn(uint256) should be declared external:
	- ERC20Burnable.burn(uint256) (@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol#16-18)
burnFrom(address,uint256) should be declared external:
	- ERC20Burnable.burnFrom(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol#23-25)
mint(address,uint256) should be declared external:
	- ERC20Mintable.mint(address,uint256) (@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol#20-23)
validateWhitelistedUserAndKey(address,string) should be declared external:
	- OwnableWhitelist.validateWhitelistedUserAndKey(address,string) (OwnableWhitelist.sol#24-29)
owner() should be declared external:
	- Ownable.owner() (@openzeppelin/contracts/ownership/Ownable.sol#28-30)
renounceOwnership() should be declared external:
	- Ownable.renounceOwnership() (@openzeppelin/contracts/ownership/Ownable.sol#54-57)
transferOwnership(address) should be declared external:
	- Ownable.transferOwnership(address) (@openzeppelin/contracts/ownership/Ownable.sol#63-65)
name() should be declared external:
	- ERC20Detailed.name() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#27-29)
symbol() should be declared external:
	- ERC20Detailed.symbol() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#35-37)
decimals() should be declared external:
	- ERC20Detailed.decimals() (@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol#51-53)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#public-function-that-could-be-declared-external[0m
INFO:Slither:. analyzed (17 contracts with 46 detectors), 67 result(s) found
INFO:Slither:[94mUse https://crytic.io/ to get access to additional detectors and Github integration[0m
