# Sifchain Token Sale

## Approve erowan (MUST)
New controller *MUST* approve remaining rowan to be able to add liquidity via service.
```
1. Set PRIVATE_KEY in .env PRIVATE_KEY_CONTROLLER
2. Run `yarn pool:approveErowan --network mainnet`
```

## Start sales & liquidity service (MUST)
```
1. Set PRIVATE_KEY in .env PRIVATE_KEY_CONTROLLER
2. Right at the start of token sale, run `yarn pool:startSales --network mainnet`
3. Within 50 minutes from the start of the token sale, login into the server, pull latest code
from master branch, set correct .env vars, and finally run `yarn pool:service mainnet`
```

## Change gas price limit (OPTIONAL)
The limit should be set in wei, so 500 gwei is `500000000000`. Default limit is 400 gwei.
```
1. Set PRIVATE_KEY in .env PRIVATE_KEY_CONTROLLER
2. Run `yarn pool:setGasPrice 500000000000 --network mainnet`
```

## Finalize sales (MUST)
New controller *MUST* finalize sales after 168 hours.
```
1. Set PRIVATE_KEY in .env PRIVATE_KEY_CONTROLLER
2. set COLD_STORAGE_ADDRESS in .env to the cold storage addresss
3. `yarn pool:exit --network mainnet`
```

## Burn remaining erowan (OPTIONAL)
```
1. Set PRIVATE_KEY in .env PRIVATE_KEY_CONTROLLER
2. `yarn burn:rowan --network mainnet>`
```
