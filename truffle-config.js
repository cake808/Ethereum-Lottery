const HDWalletProvider = require("truffle-hdwallet-provider");

// See <http://truffleframework.com/docs/advanced/configuration>
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

module.exports = {
    compilers: {
        solc: {
            version: "^0.5.7",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    },
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY),
            network_id: 3,
            gas: 3000000,
            gasPrice: 10000000000
        }
    }
};
