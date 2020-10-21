# Overview

Here is how to use the service daemon to send transactions to the mainnet during the crowdsale.

1. First, in the .env file add the following variables and fill in the eRowan address and the bPool address

```
EROWAN='eRowan address on mainnet'
BPOOL=''bpool address on mainnet'
```

2. Make sure that the controller address in the .env file is set to your address. Also make sure that the private key in the .env file is your private key.

3. Then run the command to execute this script not on a schedule:
```
truffle exec scripts/serviceDaemon.js --network mainnet
```

4. How to run this cronjob:

```
node scripts/cron.js
```
