# How to run Slither on the Smart Contracts

```
docker pull trailofbits/eth-security-toolbox
```

Then run
```
docker run -it --network host -v ~/Desktop/balancer:/share trailofbits/eth-security-toolbox
```

Then once inside the docker container, go into the balancer repo, select your solc version as 0.5.12

```
solc-select 0.5.12
cd /share
```

Now run:
```
d=`date +"%m-%d"` && slither --compile-force-framework truffle . 2>Slither-${d}.md
```