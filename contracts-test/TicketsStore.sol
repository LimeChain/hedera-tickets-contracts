pragma solidity 0.6.7;

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

    mapping(address => mapping(uint256 => Ticket) public ticketsOwner;
    // Todo: Think of how to get ticketGroup by groupID
    // TicketGroup[] ticketsGroups;

    mapping(uint256 => TicketGroup) public ticketsByPrice;

    constructor(uint256 ticketsAmount) public {
        amount = ticketsAmount;
    }

    function defineGroup(uint256 available, uint256 price) public onlyOwner {
        require(available <= amount, "More tickets than the maximum amount");
        require(
            ticketsByPrice[price] == 0x0,
            "This price has been already defined"
        );

        ticketsByPrice[price] = TicketGroup(price, available);
    }

    function buy(uint256 groupID, uint256 quantity) external payable {
        uint256 ticketPrice = msg.value.div(quantity);

        require(
            ticketsByPrice[ticketPrice].price > 0,
            "There are not any tickets for your money"
        );

        require(
            ticketsByPrice[ticketPrice].available >= quantity,
            "There are not any left tickets"
        );

        if(ticketsOwner[msg.sender][ticketPrice] == 0x0){
            ticketsOwner[msg.sender][ticketPrice] = Ticket(ticketPrice, quantity);
        }else{
            ticketsOwner[msg.sender][ticketPrice].quantity = ticketsOwner[msg.sender][ticketPrice].quantity.add(quantity);
        }

        ticketsByPrice[ticketPrice].available = ticketsByPrice[ticketPrice]
            .available
            .sub(quantity);
    }

    function withdraw() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
