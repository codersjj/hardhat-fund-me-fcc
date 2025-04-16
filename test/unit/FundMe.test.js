/*
Unit tests are done locally
- local hardhat
- forked hardhat

Staging tests can be done on a testnet (LAST STOP!!)
*/

const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
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
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
        // console.log("🚀 ~ beforeEach ~ mockV3Aggregator:", mockV3Aggregator)
      })

      describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
          const getPriceFeed = await fundMe.getPriceFeed()
          // console.log("🚀 ~ it ~ getPriceFeed:", getPriceFeed)
          assert.equal(getPriceFeed, mockV3Aggregator.target)
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
          const amountFunded = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(amountFunded, sendValue)
        })

        it("Adds funder to array of getFunders", async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunders(0)
          assert.equal(funder, deployer)
        })
      })

      describe("getVersion", function () {
        it("returns the version of the price feed", async () => {
          const version = await fundMe.getVersion()
          const expectedVersion = await mockV3Aggregator.version()
          assert.equal(version, expectedVersion)
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
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

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
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            endingDeployerBalance + gasCost,
            startingDeployerBalance + startingFundMeBalance
          )
        })

        it("allows us to withdraw with multiple getFunders", async () => {
          // Arrange
          const accounts = await ethers.getSigners()
          // i = 0 is deployer, so we start at 1
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          )
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Act
          const txResponse = await fundMe.withdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice, gasPrice } = txReceipt
          const gasCost = gasUsed * (effectiveGasPrice ?? gasPrice)
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          )
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            endingDeployerBalance + gasCost,
            startingDeployerBalance + startingFundMeBalance
          )

          // Make sure that the getFunders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted
          for (let i = 0; i < 6; i++) {
            // const amount = await fundMe.getAddressToAmountFunded(accounts[i].address)
            // assert.equal(amount, 0)
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            attackerConnectedContract,
            "FundMe__NotOwner"
          )
        })

        it("cheaperWithdraw ~ withdraw ETH from a single founder", async () => {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          )
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Act
          const txResponse = await fundMe.cheaperWithdraw()
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
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            endingDeployerBalance + gasCost,
            startingDeployerBalance + startingFundMeBalance
          )
        })

        it("cheaperWithdraw ~ allows us to withdraw with multiple getFunders", async () => {
          // Arrange
          const accounts = await ethers.getSigners()
          // i = 0 is deployer, so we start at 1
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          )
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Act
          const txResponse = await fundMe.cheaperWithdraw()
          const txReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice, gasPrice } = txReceipt
          const gasCost = gasUsed * (effectiveGasPrice ?? gasPrice)
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          )
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            endingDeployerBalance + gasCost,
            startingDeployerBalance + startingFundMeBalance
          )

          // Make sure that the getFunders are reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted
          for (let i = 0; i < 6; i++) {
            // const amount = await fundMe.getAddressToAmountFunded(accounts[i].address)
            // assert.equal(amount, 0)
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("cheaperWithdraw ~ only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(
            attackerConnectedContract.cheaperWithdraw()
          ).to.be.revertedWithCustomError(
            attackerConnectedContract,
            "FundMe__NotOwner"
          )
        })
      })
    })
