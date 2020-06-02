pragma solidity 0.6.7;

import "./../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../node_modules/@openzeppelin/contracts/access/Ownable.sol";

// Todo: Implement a period
contract TicketsStore is Ownable {
    using SafeMath for uint256;

    uint256 public offeringExpiration;
    uint256 public eventCommission;

    mapping(address => uint256) public withdrawers;
    mapping(address => mapping(uint256 => uint256[])) public ticketsOwner;
    mapping(address => mapping(uint256 => uint256[])) public resellerPrices;


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

    constructor(uint256 commissionPercentage, uint256 duration) public {
        eventCommission = commissionPercentage;
        offeringExpiration = now.add(duration);
    }

    function defineGroup(uint256 available, uint256 price) public onlyOwner {
        require(price > 0, "Price can not be 0");
        for (uint256 i = 0; i < groups.length; i++) {
            require(groups[i].price != price, "Such a group already exists");
        }

        groups.push(TicketGroup(available, price, available, price));
    }

    function buy(uint256 groupID) external payable {
        require(groups.length - 1 <= groupID, "Such tickets group does not exist");


        bool hasOnSecondaryMarket = checkOnSecondaryMarket(groupID);
        if(hasOnSecondaryMarket) {
            buyOnSecondaryMarket(groupID);
        }else{
            buyOnPrimaryMarket(groupID);
        }
    }

    function checkOnSecondaryMarket(uint256 groupID) private view returns(bool) {
        return 
        minimalGroupsPrice[groupID].reseller != address(0) && 
        minimalGroupsPrice[groupID].minimalPrice < groups[groupID].sellCurve;
    }
// Secondary Market
 /*
    Todo: Set new minimalPrice
    Todo: Sellcurve drop mechanism
*/
    function buyOnSecondaryMarket(uint256 groupID) private {
        require(minimalGroupsPrice[groupID].minimalPrice <= msg.value, "Not enough money");

        GroupResell memory groupResell = minimalGroupsPrice[groupID];

        ticketsOwner[msg.sender][groupID].push(minimalGroupsPrice.minimalPrice);
        delete ticketsOwner[groupResell.reseller][groupID][groupResell.ticketID];

        uint256 commission = groupResell.minimalPrice.mul(eventCommission).div(100);
        
        // Calculate withdraw amounts
        withdrawers[address(this)] = withdrawers[address(this)].add(commission);
        withdrawers[groupResell.reseller] = withdrawers[groupResell.reseller].add(
            groupResell.minimalPrice.sub(commission)
        );
        // In case msg.sender has payed more
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.sub(groupResell.minimalPrice)
        );
        
        setGroupReseller(groupID);
        groups[groupID].sellCurve = groups[groupID].sellCurve.sub(calculateDrop());
    }

    // Todo: Implement soft mechanism for doing it
    function setGroupReseller(uint256 groupID) private view {
        // minimalGroupsPrice[groupID].reseller = newReseller;
        // minimalGroupsPrice[groupID].ticketID = ticketID;
        // minimalGroupsPrice[groupID].minimalPrice = ticketsOwner[msg.sender][groupID][ticketID];
    }

// Primary Market
    // Todo: Sellcurve up mechanism
    function buyOnPrimaryMarket(uint256 groupID) private {
        TicketGroup storage group = groups[groupID];

        require(group.sellCurve <= msg.value, "Not enough money");
        require(group.available >= 1, "There are not any left tickets");

        ticketsOwner[msg.sender][groupID].push(group.sellCurve);

        withdrawers[address(this)] = withdrawers[address(this)].add(group.sellCurve);
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.sub(group.sellCurve)
        );

        group.available = group.available.sub(1);
        group.sellCurve = group.sellCurve.add(calculateUp());
    }

// Resell
    // Todo: Once reselled -> could not be refunded
    // Todo: Consider ticket ids so a reseller could resell some tickets and could get refunded for others
    function resell(uint256 groupID, uint256 desiredPrice) public {
        require(
            ticketsOwner[msg.sender][groupID].length > 0,
            "No owned tickets"
        );

        resellerPrices[msg.sender][groupID].push(desiredPrice);

        // Only for first reseller for a group
        if(minimalGroupsPrice[groupID].reseller == address(0)){
            minimalGroupsPrice[groupID] = GroupResell(msg.sender, desiredPrice);
        }

        if(minimalGroupsPrice[groupID].minimalPrice > desiredPrice){
            minimalGroupsPrice[groupID].reseller = msg.sender;
            minimalGroupsPrice[groupID].minimalPrice = desiredPrice;
        }
    }

// Refund
    // Todo: Once reselled -> could not be refunded
    function refund(uint256 groupID, uint256 ticketID) external {
        require(now <= offeringExpiration, "Offering has ended");
        require(ticketsOwner[msg.sender][groupID].length > ticketID, "You don't own such a ticket");
        // Re-entrancy guard for curve dropping
        require(ticketsOwner[msg.sender][groupID][ticketID] > 0, "Already refunded");
        
        // Prevent re-entrancy atack
        uint256 refundPrice = ticketsOwner[msg.sender][groupID][ticketID];
        delete ticketsOwner[msg.sender][groupID][ticketID];
        
        msg.sender.transfer(refundPrice);

        groups[groupID].sellCurve = groups[groupID].sellCurve.sub(calculateDrop());
    }

// Withdraw
    function withdraw() external {
        address payable receiver = payable(msg.sender);
        address payable moneyOwner = payable(msg.sender);

        if(msg.sender == owner()){
            moneyOwner = address(this);
        }

        uint256 amount = withdrawers[moneyOwner];
        withdrawers[moneyOwner] = 0;

        receiver.transfer(amount);
    }

// Formulas
    // Todo: Implement it
    function calculateDrop() private view returns(uint256) {
        return 1000000000000000000; // 1 ether
    }

    // Todo: Implement it
    function calculateUp() private view returns(uint256) {
        return 1000000000000000000; // 1 ether
    }

    fallback() external payable { }
}
