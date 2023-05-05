require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require('hardhat-deploy');
module.exports = {
  namedAccounts: {
    deployer: {
      default: 0,
      35011: "0xf50d76C91037C153D431815eC943d6E0B8fa4F97",
      3501: "0xf50d76C91037C153D431815eC943d6E0B8fa4F97",
    },
  },
  networks: {
    tch: {
      url: "https://rpc.thaichain.org",
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 7,
    },

    j2o: {
      url: "https://rpc.j2o.io",
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 35011,
    },
    jfin: {
      url: "https://rpc.jfinchain.com",
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
