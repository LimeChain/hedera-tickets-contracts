pragma solidity 0.6.8;

import "./../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract TicketsMarket is Ownable {
    using SafeMath for uint256;

    uint256 public salesDuration;
    uint256 public amount;
    uint256 public eventCommission;

    uint256[] public sellPrices;
    uint256 constant public UP_RATIO = 25; // 25%
    uint256 constant public DROP_RATIO = 25; // 25%

    struct Ticket {
        uint256 price;
        uint256 quantity;
    }


    struct TicketGroup {
        uint255 id;
        uint256 price;
        uint256 sellCurve;
        uint256 available;
    }

    public TicketGroup[] groups;
   

    // mapping(address => mapping(uint256 => Ticket) public ticketsOwner;
    // // Todo: Think of how to get ticketGroup by groupID
    // // TicketGroup[] ticketsGroups;

    // mapping(uint256 => TicketGroup) public ticketsByPrice;

    modifier unlocked(){
        require(salesDuration < now, "Sales period not exceed");        
        _;
    }

    modifier nonExistentGroup(uint256 price){
        for (uint256 i = 0; i < groups.length; i++) {
            require(groups[i].price != price, "Such a group already exists");
        }
        _;
    }

    // Todo: Ticket id => group.nonce
    // Todo: Implement start function locking some other functions
    constructor(uint256 ticketsAmount, uint256 duration, uint256 commission) public {
        amount = ticketsAmount;
        salesDuration = now.add(duration);
        eventCommission = commission;
    }

    function defineGroup(uint256 available, uint256 price) public onlyOwner nonExistentGroup(price) {
        require(available <= amount, "More tickets than the maximum amount");

        groups.push(TicketGroup(price, available));
        numberOfGroups = groups.length;
        groups[numberOfGroups - 1].id = numberOfGroups;
    }

    // Todo: May provide more money
    function buy(uint256 groupID) external payable {
        TicketGroup memory group = groups[groupID];

    
        // Todo: check on the primary market
        require(group.sellCurve == msg.value, "Not enough money");
        require(group.available >= 1, "There are not any left tickets");

        // Todo: check on the secondary market
        require(market[groupID][msg.value] != 0x0, "Not enough money");


        // if(ticketsOwner[msg.sender][ticketPrice] == 0x0){
        //     ticketsOwner[msg.sender][ticketPrice] = Ticket(ticketPrice, quantity);
        // }else{
        //     ticketsOwner[msg.sender][ticketPrice].quantity = ticketsOwner[msg.sender][ticketPrice].quantity.add(quantity);
        // }

        // ticketsByPrice[ticketPrice].available = ticketsByPrice[ticketPrice]
        //     .available
        //     .sub(quantity);
    }

     function resell(uint256 ticketPrice, uint256 desiredPrice) public {
        require(
            ticketsOwner[msg.sender][ticketPrice].quantity > 0,
            "No owned tickets"
        );
    }

    // Todo: Drop the sell curve
    function refund(ticketPrice) external {
        require(
            ticketsOwner[msg.sender][ticketPrice].quantity > 0,
            "No owned tickets"
        );

        ticketsOwner[msg.sender][ticketPrice].quantity = ticketsOwner[msg.sender][ticketPrice].quantity.sub(1);
        msg.sender.transfer(ticketPrice);
    }

    function withdraw() external unlocked onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    // Todo: Implement it
    function calculateDrop() private view returns(uint256) {
        return 1;
    }

    // Todo: Implement it
    function calculateUp() private view returns(uint256) {
        return 1;
    }
}
