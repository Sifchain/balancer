require('dotenv').config();
const {PRIVATE_KEY, NETWORK, INFURA_KEY} = process.env;
const HDWalletProvider = require("@truffle/hdwallet-provider");
const privateKeys = [PRIVATE_KEY];

console.log("PRIVKEY: ", privateKeys);
console.log("NETWORK: ", NETWORK);

module.exports = {
    plugins: ["solidity-coverage"],
    networks: {
        local: {
            host: 'localhost', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*', // Any network (default: none)
        },
        development: {
            host: 'localhost', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*', // Any network (default: none)
        },
        kovan: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://kovan.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: 6700000,           // Default gas to send per transaction
            gasPrice: 100000000000, // 100 gwei (default: 20 gwei)
            confirmations: 0,       // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
        },
        ropsten: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://ropsten.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: 6700000,           // Default gas to send per transaction
            gasPrice: 100000000000, // 100 gwei (default: 20 gwei)
            confirmations: 0,       // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
        },
        mainnet: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://mainnet.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: 6700000,           // Default gas to send per transaction
            gasPrice: 100000000000, // 100 gwei (default: 20 gwei)
            confirmations: 0,       // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
        },
    },

    mocha: {
        enableTimeouts: false,
        before_timeout: 12000,
        useColors: true
    },
    compilers: {
        solc: {
            version: '0.5.12',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1,
                },
                evmVersion: 'byzantium',
            },
        },
    },
};
