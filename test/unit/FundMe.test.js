/*
Unit tests are done locally
- local hardhat
- forked hardhat

Staging tests can be done on a testnet (LAST STOP!!)
*/

const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", function () {
  let fundMe = null
  let deployer = null
  let mockV3Aggregator = null
  // const sendValue = "1000000000000000000" // 1 ETH
  const sendValue = ethers.parseEther("1") // 1 ETH

  beforeEach(async () => {
    // deploy our fundMe contract
    // using hardhat deploy

    // const signers = await ethers.getSigners()
    // const accountZeroAddress = signers[0].address
    // console.log("🚀 ~ beforeEach ~ accountZeroAddress:", accountZeroAddress)
    deployer = (await getNamedAccounts()).deployer
    // console.log("🚀 ~ beforeEach ~ deployer:", deployer)

    await deployments.fixture(["all"])

    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    // console.log("🚀 ~ beforeEach ~ mockV3Aggregator:", mockV3Aggregator)
  })

  describe("constructor", function () {
    it("sets the aggregator addresses correctly", async () => {
      const priceFeed = await fundMe.priceFeed()
      // console.log("🚀 ~ it ~ priceFeed:", priceFeed)
      assert.equal(priceFeed, mockV3Aggregator.target)
    })
  })

  describe("fund", function () {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.reverted
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      )
    })

    it("update the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue })
      const amountFunded = await fundMe.addressToAmountFunded(deployer)
      assert.equal(amountFunded, sendValue)
    })

    it("Adds funder to array of funders", async () => {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })

  describe("withdraw", function () {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue })
    })

    it("withdraw ETH from a single founder", async () => {
      // Arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      )
      const startingDeployerBalance = await ethers.provider.getBalance(deployer)

      // Act
      const txResponse = await fundMe.withdraw()
      // console.log("🚀 ~ it ~ txResponse:", txResponse)
      const txReceipt = await txResponse.wait(1)
      // console.log("🚀 ~ it ~ txReceipt:", txReceipt)
      const { gasUsed, effectiveGasPrice, gasPrice } = txReceipt
      console.log(
        "🚀 ~ it ~ gasUsed, effectiveGasPrice, gasPrice:",
        gasUsed,
        effectiveGasPrice,
        gasPrice
      )
      const gasCost = gasUsed * (effectiveGasPrice ?? gasPrice)

      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      )
      const endingDeployerBalance = await ethers.provider.getBalance(deployer)

      // Assert
      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        endingDeployerBalance + gasCost,
        startingDeployerBalance + startingFundMeBalance
      )
    })
  })
})
