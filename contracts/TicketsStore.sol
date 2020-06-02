pragma solidity 0.6.8;

import "./../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract TicketsStore is Ownable {
    using SafeMath for uint256;

    uint256 public amount;

    struct Ticket {
        uint256 price;
        uint256 quantity;
    }

    struct TicketGroup {
        uint256 price;
        uint256 available;
    }

    mapping(address => Ticket) public ticketOwner;
    // Todo: Think of how to get ticketGroup by groupID
    mapping(uint256 => TicketGroup) public ticketsByPrice;

    constructor(uint256 ticketsAmount) public {
        amount = ticketsAmount;
    }

    // Todo: Revert if such a price has been already defined
    // Todo: Implement group ID
    function defineGroup(uint256 available, uint256 price) public onlyOwner {
        require(available <= amount, "More tickets than the maximum amount");
        ticketsByPrice[price] = TicketGroup(price, available);
    }

    // Todo: Should be able to buy tickets several times
    // Todo: Should be able to buy tickets for different prices
    function buy(uint256 quantity) external payable {
        uint256 ticketPrice = msg.value.div(quantity);

        require(
            ticketsByPrice[ticketPrice].price > 0,
            "There are not any tickets for your money"
        );

        require(
            ticketsByPrice[ticketPrice].available >= quantity,
            "There are not any left tickets"
        );

        ticketOwner[msg.sender] = Ticket(ticketPrice, quantity);

        ticketsByPrice[ticketPrice].available = ticketsByPrice[ticketPrice]
            .available
            .sub(quantity);
    }

    // Todo: Consider withdrawing to be unlocked after some period
    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
