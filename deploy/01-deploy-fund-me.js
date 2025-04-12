// import

const { network } = require("hardhat")

// main function

// calling of main function

// function deployFunc(hre) {
//   console.log("deploy~")
//   console.log(hre.getNamedAccounts())
//   console.log(hre.deployments)
// }

// module.exports.default = deployFunc
// module.exports = deployFunc

// module.exports = async (hre) => {
//   hre.getNamedAccounts
//   hre.deployments
//   const { getNamedAccounts, deployments } = hre
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  console.log("🚀 ~ module.exports= ~ deployer:", deployer)
  const chainId = network.config.chainId
  console.log("🚀 ~ module.exports= ~ chainId:", chainId)
}
