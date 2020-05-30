pragma solidity 0.6.7;

import "./../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract TicketsStore is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public withdrawers;
    mapping(address => mapping(uint256 => uint256[])) public resellerPrices;

    // struct Ticket {
    //     uint256 price;
    //     uint256 quantity;
    // }
    // Owner of the ticket => groupID => ticket prices
    mapping(address => mapping(uint256 => uint256[])) public ticketsOwner;


    struct TicketGroup {
        uint256 total;
        uint256 price;
        uint256 available;
        uint256 sellCurve;
    }
    TicketGroup[] public groups;

    struct GroupResell {
        address reseller;
        uint256 minimalPrice;
    }
    mapping(uint256 => GroupResell) public minimalGroupsPrice;

    // modifier unlocked(){
    //     require(salesDuration < now, "Sales period not exceed");
    //     _;
    // }

    constructor() public {}

    function defineGroup(uint256 available, uint256 price) public onlyOwner {
        for (uint256 i = 0; i < groups.length; i++) {
            require(groups[i].price != price, "Such a group already exists");
        }

        groups.push(TicketGroup(available, price, available, price));
    }

    function buy(uint256 groupID) external payable {
        require(groups.length - 1 <= groupID, "Such tickets group does not exist");


        bool hasOnSecondaryMarket = checkOnSecondaryMarket(groupID, msg.value);
        if(hasOnSecondaryMarket) {
            // buyOnSecondaryMarket(groupID, groupResell);
        }else{
            buyOnPrimaryMarket(groupID);
        }
    }

    function checkOnSecondaryMarket(uint256 groupID, uint256 price) private view returns(bool) {
        return minimalGroupsPrice[groupID].reseller != address(0) && minimalGroupsPrice[groupID].minimalPrice <= price;
    }
// Secondary Market
    // function buyOnSecondaryMarket(uint256 groupID, GroupResell memory groupResell) private {
    //     TicketGroup memory group = groups[groupID];

    //     ticketsOwner[msg.sender][groupID].push(groupResell.minimalPrice);
    //     // ticketsOwner[msg.sender][groupID].quantity = ticketsOwner[msg.sender][groupID].quantity.add(1);
    //     ticketsOwner[groupResell.reseller][groupID].quantity = ticketsOwner[groupResell.reseller][groupID].quantity.sub(1);

    //     uint256 eventCommisions = groupResell.minimalPrice.sub(2);
    //     withdrawers[address(this)] = eventCommisions;
    //     withdrawers[msg.sender] = msg.value.sub(groupResell.minimalPrice);
    //     withdrawers[groupResell.reseller] = withdrawers[groupResell.reseller].add(groupResell.minimalPrice.sub(eventCommisions));

    //     group.sellCurve = group.sellCurve.sub(calculateDrop());

    //     /*
    //         Todo: Set new minimalPrice
    //         Todo: Sellcurve drop mechanism
    //         Todo: ticketsOwner[msg.sender] => should keep the price he has payed
    //     */
    // }
// Primary Market
    function buyOnPrimaryMarket(uint256 groupID) private {
        TicketGroup storage group = groups[groupID];

        require(group.sellCurve <= msg.value, "Not enough money");
        require(group.available >= 1, "There are not any left tickets");

        ticketsOwner[msg.sender][groupID].push(group.sellCurve);

        withdrawers[msg.sender] = msg.value.sub(group.sellCurve);
        withdrawers[address(this)] = group.sellCurve;

        /*
            Todo: Sellcurve up mechanism
        */
        group.available = group.available.sub(1);
        group.sellCurve = group.sellCurve.add(calculateUp());
    }

// Resell
    // function resell(uint256 groupID, uint256 desiredPrice) public {
    //     require(
    //         ticketsOwner[msg.sender][groupID].quantity > 0,
    //         "No owned tickets"
    //     );

    //     resellerPrices[msg.sender][groupId].push(desiredPrice);

    //     // Only for first reseller for a group
    //     if(minimalGroupsPrice[groupID] == 0x0){
    //         minimalGroupsPrice[groupID] = GroupResell(msg.sender, desiredPrice);
    //     }

    //     if(minimalGroupsPrice[groupID].minimalPrice > desiredPrice){
    //         minimalGroupsPrice[groupID].reseller = msg.sender;
    //         minimalGroupsPrice[groupID].minimalPrice = desiredPrice;
    //     }
    // }

// Refund
    // Todo: Send msg.sender approriate amount of money
    // function refund(uint256 groupID) external {
    //     require(
    //         ticketsOwner[msg.sender][groupID].quantity > 0,
    //         "No owned tickets"
    //     );

    //     ticketsOwner[msg.sender][groupID].quantity = ticketsOwner[msg.sender][groupID].quantity.sub(1);
    //     msg.sender.transfer(ticketPrice);

    //     groups[groupID].sellCurve = groups[groupID].sellCurve.sub(calculateDrop());
    // }

// Withdraw
    // function withdraw() external onlyOwner {
    //     msg.sender.transfer(withdrawers[address(this)]);
    // }

// Formulas
    // // Todo: Implement it
    // function calculateDrop() private view returns(uint256) {
    //     return 1;
    // }

    // Todo: Implement it
    function calculateUp() private view returns(uint256) {
        return 1;
    }
}
