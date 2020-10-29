# Overview

Here is how to use the service daemon to send transactions to the mainnet during the crowdsale.

1. First, in the .env file add the following variables and fill in the eRowan address and the bPool address

```
EROWAN='eRowan address on mainnet'
USDT='USDT address on mainnet'
```

2. Make sure that the controller address in the .env file is set to your address. Also make sure that the private key in the .env file is your private key.

3. Then run the command to execute this script not on a schedule:
```
truffle exec scripts/serviceDaemon.js --network mainnet
```

4. Set Up the Slack hook for daemon
Go to the .env file and paste the ending lines of your slack key into it minus the first slash for your unique code.

For example, if your slack URL is:

https://hooks.slack.com/services/Jlkejoialke/theilaiwejnj/eeigoeal

Then only use 
Jlkejoialke/theilaiwejnj/eeigoeal 
in the slack key variable in your .env file.

4. To run this cronjob, start at the root directory, then run this command:

```
node scripts/cron.js
```

