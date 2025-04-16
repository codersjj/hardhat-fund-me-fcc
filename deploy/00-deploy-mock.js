// see: https://github.com/wighawag/hardhat-deploy?tab=readme-ov-file#the-deploy-task:~:text=It%20will%20scan%20for%20files%20in%20alphabetical%20order%20and%20execute%20them%20in%20turn.

const { network } = require("hardhat")
const {
  deploymentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (!deploymentChains.includes(network.name)) {
    return
  }

  console.log("---00-deploy-mock ~ Local network detected!")
  log("Local network detected! Deploying mocks...")
  await deploy("MockV3Aggregator", {
    contract: "MockV3Aggregator",
    from: deployer,
    args: [DECIMALS, INITIAL_ANSWER],
    log: true,
  })
  log("Mocks deployed!")
  log("----------------------------------------------------")
}

module.exports.tags = ["all", "mocks"]
