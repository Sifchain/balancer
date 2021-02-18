# Balancer
## Run backend
```
export PATH=$(npm bin):$PATH
cat env.example >> .env
ganache-cli -d
```

## Migrate to local network
```
0. `cat env.example >> .env` - Set env vars
1. `yarn` - Install top-level dependencies
2. `yarn ganache` - Run ganache-cli (in a separate window)
3. `yarn migrate:local` - Run migrations and deploy contracts
4. Copy USDT and ROWAN contract addresses into .env (used in step 5 and 6)
5. `yarn tokendata` - Copy USDT and ROWAN addresses from env into json that is read from utils
6. `yarn pool:init` - Init balancer pool
7. Add addresses and confirmation codes to scripts/whitelist.json to be used for testing
8. `yarn pool:whitelist` - Whitelist accounts from whitelist.json
9. `yarn build:ui` - Build UI (core & app)
10. `yarn serve:ui` - Start the app at http://localhost:8080/
```

## Migrate to testnet
```
0. `cat env.example >> .env`
1. `yarn` - Install dependencies
2. set WHITE_LIST_MANAGER, CONTROLLER, PRIVATE_KEY, COLD_STORAGE_ADDRESS and INFURA_KEY in .env
3. `yarn migrate:ropsten`
4. Copy newly migrated USDT and ROWAN contract addresses into .env
5. `yarn tokendata --network ropsten` - Copy USDT and ROWAN addresses from env into json that is read from utils
6. set PRIVATE_KEY in .env to rowan owner.
7. `yarn mint:rowan --network <network name>`
8. set PRIVATE_KEY in .env to CONTROLLER
9. `yarn pool:init --network <network name>`
10. set PRIVATE_KEY in .env to WHITE_LIST_MANAGER
11. `yarn pool:whitelist --network <network name>`
12. `yarn build:ui` - Build UI (core & app)
13. `yarn serve:ui` - Start the app at http://localhost:8080/
14. By now deployment is done. Once KYC is done and we are ready to start sales:
15. set PRIVATE_KEY in .env to CONTROLLER
16. `yarn pool:startSales --network <network name>`
17. create slack app with Webhook support and set SLACK_KEY in .env to the web hook key removing the first "https://hooks.slack.com/services/" from it
18. `yarn pool:service <network name>` - to run service which will provide liquidity each hour
```

## Migrate to mainnet
```
0. `cat env.example >> .env`
1. `yarn` - Install dependencies
2. Copy USDT and ROWAN contract addresses into .env
3. set WHITE_LIST_MANAGER, CONTROLLER, PRIVATE_KEY, COLD_STORAGE_ADDRESS and INFURA_KEY in .env
4. `yarn migrate:mainnet`
5. `yarn tokendata --network mainnet` - Copy USDT and ROWAN addresses from env into json that is read from utils
6. set PRIVATE_KEY in .env to rowan owner.
7. `yarn mint:rowan --network mainnet`
8. set PRIVATE_KEY in .env to CONTROLLER. Controller must have USDT and eRowan on balance by that time.
9. `yarn pool:init --network mainnet`
10. set PRIVATE_KEY in .env to WHITE_LIST_MANAGER
11. `yarn pool:whitelist --network mainnet` - Whitelist accounts from whitelist.json
12. `yarn build:ui` - Build UI (core & app)
13. `yarn serve:ui` - Start the app at http://localhost:8080/
14. By now deployment is done. Once KYC is done and we are ready to start sales
15. set PRIVATE_KEY in .env to CONTROLLER
16. `yarn pool:startSales --network mainnet`
17. create slack app with Webhook support and set SLACK_KEY in .env to the web hook key removing the first "https://hooks.slack.com/services/" from it
18. `yarn pool:service mainnet` - to run service which will provide liquidity each hour
```

## Slack hook for daemon
Go to the .env file and paste the ending lines of your slack hook key into it minus the first slash for your unique code.
Then add the slack failure channel hook key in and start the daemon.

## Finalize sales
```
0. set PRIVATE_KEY in .env to CONTROLLER
1. set COLD_STORAGE_ADDRESS in .env the cold storage address
2. `yarn pool:exit --network <network name>`
3. `yarn burn:rowan --network <network name>`
```

## Transfer ownership
```
1. To transfer pool ownership set PRIVATE_KEY in .env to CONTROLLER.
2. Set NEW_CONTROLLER to new controller address.
3. `yarn ownership:pool --network <network name>`
4. To transfer rowan ownership set PRIVATE_KEY in .env to rowan owner.
5. Set NEW_OWNER_EROWAN to the new rowan owner address.
6. `yarn ownership:rowan --network <network name>`
7. No need to transfer ownership of cold storage address as that is set up during construction. Call the coldStorage function on the contract to get the cold storage address and confirm that it is correct.
```

## Change gas price limit
The limit should be set in wei, so 500 gwei is `500*10e9`, or `500000000000`
```
1. Set PRIVATE_KEY to balancer pool CONTROLLER
2. Run `yarn pool:setGasPrice 500000000000 --network <network name>`
```

## Approve erowan
New controller should approve remaining rowan to be able to add liquidity 
```
1. Set PRIVATE_KEY to balancer pool CONTROLLER
2. Run `yarn pool:approveErowan --network <network name>`
```
