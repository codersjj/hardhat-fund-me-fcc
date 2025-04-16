const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let deployer = null
      let fundMe = null
      const sendValue = ethers.parseUnits("31705770", "gwei")

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue })
        const txResponse = await fundMe.withdraw({ gasLimit: 1000000 })
        await txResponse.wait()
        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMe.target
        )
        assert.equal(
          endingFundMeBalance.toString(),
          "0",
          "Ending balance should be 0"
        )
      })
    })
