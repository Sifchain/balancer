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
2. set WHITE_LIST_MANAGER, CONTROLLER, PRIVATE_KEY and INFURA_KEY in .env
3. `yarn migrate:testnet --network <network name>`
4. Copy newly migrated USDT and ROWAN contract addresses into .env
5. `yarn tokendata --network <network name>` - Copy USDT and ROWAN addresses from env into json that is read from utils
6. set PRIVATE_KEY in .env to rowan owner.
7. `yarn mint:rowan --network <network name>`
8. set PRIVATE_KEY in .env to CONTROLLER
9. `yarn pool:init --network <network name>`
10. set PRIVATE_KEY in .env to WHITE_LIST_MANAGER
11. `yarn pool:whitelist --network <network name>`
12. `yarn build:ui` - Build UI (core & app)
13. `yarn serve:ui` - Start the app at http://localhost:8080/
14. set PRIVATE_KEY in .env to CONTROLLER
15. `yarn pool:service <network name>` - to run service which will provide liquidity each hour
```

## Migrate to mainnet
```
0. `cat env.example >> .env`
1. `yarn` - Install dependencies
2. Copy USDT and ROWAN contract addresses into .env
3. set WHITE_LIST_MANAGER, CONTROLLER, PRIVATE_KEY and INFURA_KEY in .env
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
14. set PRIVATE_KEY in .env to CONTROLLER
15. `yarn pool:service mainnet` - to run service which will provide liquidity each hour
```

## Slack hook for daemon
Go to the .env file and paste the ending lines of your slack hook key into it minus the first slash for your unique code.
Then add the slack failure channel hook key in and start the daemon.
