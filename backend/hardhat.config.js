require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
  defaultNetwork: "hardhat",
  networks: {
        hardhat: {
          forking: {
            url: `https://eth-mainnet.g.alchemy.com/v2/5tgYuO3zDJxo_EGDQdjST6F-Q9m_o9Tz`,
          },
        },
    }
};
