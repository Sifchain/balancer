# How to deploy

First check the example in env.example, copy that example into .env and then change the values to the network you want to use, your private keys, your address and your infura key. Then run the following command to deploy all the contracts

```
npx truffle migrate --reset --network mnemonic
```

After you have deployed your contracts and want to bulk whitelist users, go to the whitelist.json file, add an array of addresses that you want to whitelist in a single transaction, try to keep this below 100 addresses per transaction so that we don't go over the gas limit. Make sure all the values in the .env file is correct. Then run this command

```
truffle exec scripts/whitelistUsers.js --network mnemonic
```

You can use any network, kovan, mainnet, rinkeby, ropsten, just make sure you have deployed to that network before you run the script.