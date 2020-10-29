# How to deploy

First check the example in env.example, copy that example into .env and then change the values to the network you want to use, your private keys, your address and your infura key. Then run the following command to deploy all the contracts to mainnet

```
truffle migrate --reset --network mainnet
```

After you have deployed your contracts and want to bulk whitelist users, go to the whitelist.json file, add an array of addresses that you want to whitelist in a single transaction, try to keep this below 100 addresses per transaction so that we don't go over the gas limit. Remove the existing value from that file, that only serves as an example. 

## Key Point
Add in the correct strings for the correct user's address so they can participate in the token sale. 

Make sure all the values in the .env file is correct. Then run this command to deploy to mainnet. (You can substitute in whatever network you would like)

```
truffle exec scripts/whitelistUsers.js --network mainnet
```

You can use any network, kovan, mainnet, rinkeby, ropsten, just make sure you have deployed to that network before you run the script.