# Balancer
## Run backend
```
export PATH=$(npm bin):$PATH
cat env.example >> .env
ganache-cli -d

Testing swaps in UI:
0. `cat env.example >> .env` - Set env vars
1. `yarn` - Install top-level dependencies
2. `yarn ganache` - Run ganache-cli (in a separate window)
3. `yarn migrate:chain` - Run migrations and deploy contracts
4. Copy USDT and ROWAN contract addresses into .env (used in step 5 and 6)
5. `yarn tokendata` - Copy USDT and ROWAN addresses from env into json that is read from utils
6. `yarn pool:init` - Init balancer pool
7. `yarn pool:whitelist` - Whitelist accounts from whitelist.json
8. `yarn build:ui` - Build UI (core & app)
9. `yarn serve:ui` - Start the app at http://localhost:8080/
```

Migrate to ropsten
0. `cat env.example >> .env`
1. `yarn` - Install dependencies
2. set WHITE_LIST_MANAGER, CONTROLLER and PRIVATE_KEY in .env
3. `yarn migrate:testnet --network ropsten`
4. Copy USDT and ROWAN contract addresses into .env
5. set PRIVATE_KEY in .env to rowan owner.
6. `yarn mint:rowan --network ropsten`
7. set PRIVATE_KEY in .env to CONTROLLER
8. `yarn pool:init --network ropsten`
```

## Slack hook for daemon
Go to the .env file and paste the ending lines of your slack hook key into it minus the first slash for your unique code.
Then add the slack failure channel hook key in and start the daemon.
