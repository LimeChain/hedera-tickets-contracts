pragma solidity 0.6.7;

import "./LinkedList/LinkedListContract.sol";
import "./../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract TicketsStore is Ownable {
    using SafeMath for uint256;

    uint256 public offeringExpiration;
    uint256 public eventCommission;

    mapping(address => uint256) public withdrawers;
    mapping(address => mapping(uint256 => uint256[])) public ticketsOwner;

    struct TicketGroup {
        uint256 total;
        uint256 price;
        uint256 available;
        uint256 sellCurve;
        LinkedListContract resellers; // LinkedList resellers contract
    }
    TicketGroup[] public groups;

    struct TicketForResell {
        uint256 id;
        uint256 boughtPrice;
        uint256 resellPrice;
    }
    // Reseller | desired price | for ticket id
    mapping(address => mapping(uint256 => TicketForResell)) public ticketsForResell;

    constructor(uint256 commissionPercentage, uint256 duration) public {
        eventCommission = commissionPercentage;
        offeringExpiration = now.add(duration);
    }

    function defineGroup(uint256 available, uint256 price) public onlyOwner {
        require(price > 0, "Price can not be 0");
        for (uint256 i = 0; i < groups.length; i++) {
            require(groups[i].price != price, "Such a group already exists");
        }

        LinkedListContract resellers = new LinkedListContract();
        groups.push(TicketGroup(available, price, available, price, resellers));
    }

    function buy(uint256 groupID) external payable {
        require(
            groups.length - 1 <= groupID,
            "Such tickets group does not exist"
        );

        bool hasOnSecondaryMarket = checkOnSecondaryMarket(groupID);
        if (hasOnSecondaryMarket) {
            buyOnSecondaryMarket(groupID);
        } else {
            buyOnPrimaryMarket(groupID);
        }
    }

    function checkOnSecondaryMarket(uint256 groupID)
        private
        view
        returns (bool)
    {
        return
            groups[groupID].resellers.length() > 0 &&
            groups[groupID].resellers.getHead() < groups[groupID].sellCurve;
    }

    // Secondary Market
    /*
        Todo: Sellcurve drop mechanism
    */
    function buyOnSecondaryMarket(uint256 groupID) private {
        uint256 price = groups[groupID].resellers.getHead();

        require(price <= msg.value, "Not enough money");

        address reseller = groups[groupID].resellers.getFirstReseller(price);
        ticketsOwner[msg.sender][groupID].push(price);
        // Remove reselled ticket id
        delete ticketsOwner[reseller][groupID];

        uint256 commission = price.mul(eventCommission).div(100);
        // Calculate withdraw amounts
        withdrawers[address(this)] = withdrawers[address(this)].add(commission);
        withdrawers[reseller] = withdrawers[reseller].add(
            price.sub(commission)
        );
        // In case msg.sender has payed more
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.sub(price)
        );

        groups[groupID].resellers.popHead();
        groups[groupID].sellCurve = groups[groupID].sellCurve.sub(
            calculateDrop()
        );
    }

    // Primary Market
    /*
        Todo: Sellcurve drop mechanism
    */
    function buyOnPrimaryMarket(uint256 groupID) private {
        TicketGroup storage group = groups[groupID];

        require(group.sellCurve <= msg.value, "Not enough money");
        require(group.available >= 1, "There are not any left tickets");

        ticketsOwner[msg.sender][groupID].push(group.sellCurve);

        withdrawers[address(this)] = withdrawers[address(this)].add(
            group.sellCurve
        );
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.sub(group.sellCurve)
        );

        group.available = group.available.sub(1);
        group.sellCurve = group.sellCurve.add(calculateUp());
    }

    // Resell
    function resell(
        uint256 groupID,
        uint256 ticketID,
        uint256 desiredPrice
    ) public {
        require(
            ticketsOwner[msg.sender][groupID].length > 0,
            "No owned tickets"
        );
        require(
            ticketsOwner[msg.sender][groupID][ticketID] > 0,
            "You are not able to resell a ticket you don't own"
        );
        require(
            ticketsForResell[msg.sender][groupID].boughtPrice == 0,
            "Only one ticket for resell per group at a time"
        );

        groups[groupID].resellers.add(desiredPrice);
        ticketsForResell[msg.sender][groupID] = TicketForResell(
            ticketID,
            ticketsOwner[msg.sender][groupID][ticketID],
            desiredPrice
        );
    }

    // Refund
    function refund(uint256 groupID, uint256 ticketID) external {
        require(now <= offeringExpiration, "Offering has ended");
        require(
            ticketsOwner[msg.sender][groupID].length > ticketID,
            "You don't own such a ticket"
        );
        require(
            ticketsForResell[msg.sender][groupID].id != ticketID,
            "This ticket has been stated for resell"
        );
        // Re-entrancy guard for curve dropping
        require(
            ticketsOwner[msg.sender][groupID][ticketID] > 0,
            "Already refunded"
        );

        // Prevent re-entrancy atack
        uint256 refundPrice = ticketsOwner[msg.sender][groupID][ticketID];
        delete ticketsOwner[msg.sender][groupID][ticketID];

        msg.sender.transfer(refundPrice);

        groups[groupID].sellCurve = groups[groupID].sellCurve.sub(
            calculateDrop()
        );
    }

    // Withdraw
    function withdraw() external {
        address payable receiver = payable(msg.sender);
        address payable moneyOwner = payable(msg.sender);

        if (msg.sender == owner()) {
            moneyOwner = address(this);
        }

        uint256 amount = withdrawers[moneyOwner];
        withdrawers[moneyOwner] = 0;

        receiver.transfer(amount);
    }

    // Formulas
    // Todo: Implement it
    function calculateDrop() private view returns (uint256) {
        return 1000000000000000000; // 1 ether
    }

    // Todo: Implement it
    function calculateUp() private view returns (uint256) {
        return 1000000000000000000; // 1 ether
    }

    receive() external payable {}
}
