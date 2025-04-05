require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();
const ALCHEMY_API_KEY = process.env.ALCHEMY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.28",
      },
      {
        version: "0.8.20",
        settings: {},
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/` + ALCHEMY_API_KEY,
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/` + ALCHEMY_API_KEY,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },
};