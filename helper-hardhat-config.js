const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  // 31337
}

const deploymentChains = ["hardhat", "localhost"]

const DECIMALS = 8
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#numeric_separators
const INITIAL_ANSWER = 2000_00000000

module.exports = {
  networkConfig,
  deploymentChains,
  DECIMALS,
  INITIAL_ANSWER,
}
