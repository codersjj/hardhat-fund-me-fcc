const { network } = require("hardhat")
// const helperConfig = require("../helper-hardhat-config")
// const { networkConfig } = helperConfig
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

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
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  log("🚀 ~ module.exports= ~ deployer:", deployer)
  const chainId = network.config.chainId
  log("🚀 ~ module.exports= ~ chainId:", chainId)

  // if chainId is X use address Y
  // if chainId is Z use address A
  let priceFeedContractAddress = ""
  if (chainId in networkConfig) {
    priceFeedContractAddress = networkConfig[chainId].ethUsdPriceFeedAddress
  } else if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    priceFeedContractAddress = ethUsdAggregator.address
  }

  // if the contract doesn't exist, we deploy a minimal version of it for our local testing

  // well what happens when we want to change chains?
  // when going for localhost or hardhat network we want to use a mock
  console.log("---01-deploy-fund-me ~ start deploying FundMe contract")
  // console.log("network.config", network.config)
  const args = [priceFeedContractAddress]
  const deployResult = await deploy("FundMe", {
    from: deployer,
    args, // put constructor args here
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (chainId in networkConfig && process.env.ETHERSCAN_API_KEY) {
    // verify
    await verify(deployResult.address, args)
  }
  log("----------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
