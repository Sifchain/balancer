# Balancer
## Run backend
```
export PATH=$(npm bin):$PATH
cat env.example >> .env
ganache-cli -d

Running chain & UI
1. `yarn` - Install dependencies
2. `yarn ganache` - Run ganache-cli
3. `yarn migrate:chain` - Run migrations and deploy contracts
4. `yarn build:ui` - Build UI (core & app)
5. `yarn serve:ui` - Start the app at http://localhost:8080/
```

## Slack hook for daemon
Go to the .env file and paste the ending lines of your slack hook key into it minus the first slash for your unique code.
Then add the slack failure channel hook key in and start the daemon.
