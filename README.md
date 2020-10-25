# Balancer
## Run backend
```
export PATH=$(npm bin):$PATH
cat env.example >> .env
ganache-cli -d
```

## Slack hook for daemon
Go to the .env file and paste the ending lines of your slack hook key into it minus the first slash for your unique code.
Then add the slack failure channel hook key in and start the daemon.
