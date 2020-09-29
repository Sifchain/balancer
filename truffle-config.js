module.exports = {
    networks: {
        development: {
            host: 'localhost', // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: '*', // Any network (default: none)
        }
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
                    runs: 100,
                },
                evmVersion: 'byzantium',
            },
        },
    },
};
