// SPDX-License-Identifier: MIT
/* 
see: https://docs.soliditylang.org/en/latest/style-guide.html#order-of-layout

Contract elements should be laid out in the following order:

  Pragma statements
  Import statements
  Events
  Errors
  Interfaces
  Libraries
  Contracts

Inside each contract, library or interface, use the following order:

  Type declarations
  State variables
  Events
  Errors
  Modifiers
  Functions
*/

// Pragma
pragma solidity ^0.8.8;

// Imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol"; // for debugging

// Events

// Error codes
// see: https://x.com/PaulRBerg/status/1510584043028500492
error FundMe__NotOwner();

// Interfaces

// Libraries

// Contracts
/**
 * @title A contract for crowd funding
 * @author Shane
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface public s_priceFeed;

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions
    // see: https://docs.soliditylang.org/en/latest/style-guide.html#order-of-functions
    /*
      Functions should be grouped according to their visibility and ordered:

        constructor

        receive function (if exists)

        fallback function (if exists)

        external

        public

        internal

        private

      Within a grouping, place the view and pure functions last.
    */
    constructor(address priceFeedContractAddress) {
        i_owner = msg.sender;
        console.log("====== from FundMe.sol ====== msg.sender: ", msg.sender);
        s_priceFeed = AggregatorV3Interface(priceFeedContractAddress);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        console.log(
            "====== from FundMe.sol ====== sender %s funded %s wei",
            msg.sender,
            msg.value
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mapping can't be in memory, sorry!

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
}
