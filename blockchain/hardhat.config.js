require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "running",
  networks: {
    running: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat : {
      chainId : 31337
    }
  },
};
