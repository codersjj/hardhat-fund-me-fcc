const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log("Funding contract...")
  const txResponse = await fundMe.fund({
    value: ethers.parseUnits("0.1", "ether"),
  })
  await txResponse.wait(1)
  console.log("Funded!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
