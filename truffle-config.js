require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const { DEFAULT_GAS_PRICE, DEFAULT_GAS_AMOUNT, INFURA_KEY, PRIVATE_KEY } = process.env;
const gasPrice = DEFAULT_GAS_PRICE ? parseInt(DEFAULT_GAS_PRICE) : 250000000000;
const gasAmount = DEFAULT_GAS_AMOUNT ? parseInt(DEFAULT_GAS_AMOUNT) : 3900000;

module.exports = {
    plugins: ["solidity-coverage"],
    networks: {
        local: {
            host: 'localhost',      // Localhost (default: none)
            port: 8545,             // Standard Ethereum port (default: none)
            network_id: '*',        // Any network (default: none)
        },
        development: {
            host: 'localhost',      // Localhost (default: none)
            port: 8545,             // Standard Ethereum port (default: none)
            network_id: '*',        // Any network (default: none)
        },
        kovan: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://kovan.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: gasAmount,         // Dynamic (default: 3.9m)
            gasPrice: gasPrice,     // Dynamic (default: 250 gwei)
            confirmations: 0,       // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
        },
        ropsten: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://ropsten.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: gasAmount,         // Dynamic (default: 3.9m)
            gasPrice: gasPrice,     // Dynamic (default: 250 gwei)
            confirmations: 0,       // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
        },
        mainnet: {
            provider: () => new HDWalletProvider(PRIVATE_KEY, `https://mainnet.infura.io/v3/${INFURA_KEY}`, 0, 1),
            network_id: '*',
            gas: gasAmount,         // Dynamic (default: 3.9m)
            gasPrice: gasPrice,     // Dynamic (default: 250 gwei)
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
