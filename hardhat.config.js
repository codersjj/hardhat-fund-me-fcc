require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  // solidity: {
  //   compilers: [{ version: "0.8.28" }, { version: "0.6.6" }],
  // },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0,
      11155111: 1,
    },
    user: {
      default: 1,
    },
  },
}
