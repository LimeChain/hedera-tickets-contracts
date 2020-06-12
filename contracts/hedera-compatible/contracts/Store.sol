pragma solidity 0.6.7;

import "./ResellersList.sol";
import "./../../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "./../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TicketsStore is Ownable {
    using SafeMath for uint256;

    uint256 public constant HBAR = 100000000;

    uint256 public offeringExpiration;
    uint256 public eventCommission;

    mapping(address => uint256) public withdrawers;
    mapping(address => mapping(uint256 => uint256[])) public ticketsOwner;

    struct TicketGroup {
        // General fields
        uint256 total;
        uint256 bought;
        uint256 price;
        // Sell curve fields
        uint256 sellCurve;
        uint256 increase;
        uint256 ratio;
        ResellersList resellers; // LinkedList resellers contract
    }
    TicketGroup[] public groups;

    struct TicketForResell {
        uint256 id;
        uint256 boughtPrice;
        uint256 resellPrice;
    }
    // Reseller | desired price | for ticket id
    mapping(address => mapping(uint256 => TicketForResell)) public ticketsForResell;

    modifier onlyInSalesPeriod() {
        require(now <= offeringExpiration, "Offering has ended");
        _;
    }

    constructor(uint256 commissionPercentage, uint256 duration) public {
        eventCommission = commissionPercentage;
        offeringExpiration = now.add(duration);
    }

    function defineGroup(
        uint256 total,
        uint256 price,
        uint256 increase
    ) public onlyOwner {
        require(price > 0, "Price can not be 0");
        require(total > 0, "Number of available tickets should be at least 1");
        for (uint256 i = 0; i < groups.length; i++) {
            require(groups[i].price != price, "Such a group already exists");
        }

        ResellersList resellers = new ResellersList();
        groups.push(
            TicketGroup(
                total.add(1),
                1,
                price,
                price,
                increase,
                increase.div(total),
                resellers
            )
        );
    }

    function buy(uint256 groupID) external payable onlyInSalesPeriod {
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

    function buyOnSecondaryMarket(uint256 groupID) private {
        uint256 price = groups[groupID].resellers.getHead();

        require(price <= msg.value.mul(HBAR), "Not enough money");

        address reseller = groups[groupID].resellers.getFirstReseller(price);
        ticketsOwner[msg.sender][groupID].push(price);
        // Remove reselled ticket id
        delete ticketsOwner[reseller][groupID][ticketsForResell[reseller][groupID]
            .id];
        delete ticketsForResell[reseller][groupID];

        uint256 commission = price.mul(eventCommission).div(100);
        // Calculate withdraw amounts
        withdrawers[address(this)] = withdrawers[address(this)].add(commission);
        withdrawers[reseller] = withdrawers[reseller].add(
            price.sub(commission)
        );
        // In case msg.sender has payed more
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.mul(HBAR).sub(price)
        );

        groups[groupID].resellers.popHead();

        // Drop the curve
        calcDrop(groupID);
    }

    function buyOnPrimaryMarket(uint256 groupID) private {
        TicketGroup storage group = groups[groupID];

        require(group.sellCurve <= msg.value.mul(HBAR), "Not enough money");
        require(
            group.total.sub(group.bought) >= 1,
            "There are not any left tickets"
        );

        ticketsOwner[msg.sender][groupID].push(group.sellCurve);

        withdrawers[address(this)] = withdrawers[address(this)].add(
            group.sellCurve
        );
        withdrawers[msg.sender] = withdrawers[msg.sender].add(
            msg.value.mul(HBAR).sub(group.sellCurve)
        );

        group.bought = group.bought.add(1);
        group.sellCurve = group.sellCurve.add(group.increase);
    }

    // Resell
    function resell(
        uint256 groupID,
        uint256 ticketID,
        uint256 desiredPrice
    ) public {
        require(
            ticketsOwner[msg.sender][groupID][ticketID] > 0,
            "You are not able to resell a ticket you don't own"
        );
        require(
            ticketsForResell[msg.sender][groupID].boughtPrice == 0,
            "Only one ticket for resell per group at a time"
        );

        groups[groupID].resellers.add(desiredPrice, msg.sender);
        ticketsForResell[msg.sender][groupID] = TicketForResell(
            ticketID,
            ticketsOwner[msg.sender][groupID][ticketID],
            desiredPrice
        );
    }

    // Refund
    function refund(uint256 groupID, uint256 ticketID)
        external
        onlyInSalesPeriod
    {
        require(
            ticketsOwner[msg.sender][groupID].length > ticketID,
            "You don't own such a ticket"
        );
        require(
            ticketsForResell[msg.sender][groupID].boughtPrice == 0,
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

        // Drop the curve
        calcDrop(groupID);
    }

    // Withdraw
    function withdraw() external {
        address payable receiver = payable(msg.sender);
        address payable moneyOwner = payable(msg.sender);

        if (msg.sender == owner()) {
            moneyOwner = address(this);
        }

        uint256 amount = withdrawers[moneyOwner].div(HBAR);
        withdrawers[moneyOwner] = 0;

        receiver.transfer(amount);
    }

    // Drop ticket price
    function calcDrop(uint256 groupID) private {
        TicketGroup storage group = groups[groupID];

        group.ratio = group.increase.mul(group.bought).div(group.total);
        group.sellCurve = group.sellCurve.sub(group.ratio);
    }

    receive() external payable {}

    // Getter functions
    function getOwnedTickets() external view returns (bytes32[] memory) {
        uint256 allTicketsCount = 0;

        // Calculate how much tickets the owner has
        for (uint256 i = 0; i < groups.length; i++) {
            if (ticketsOwner[msg.sender][i].length > 0) {
                allTicketsCount += ticketsOwner[msg.sender][i].length + 2;
            }
        }

        // Load onwed tickets
        bytes32[] memory ownedTickets = new bytes32[](allTicketsCount);
        uint256 offset = 32;
        for (uint256 i = 0; i < groups.length; i++) {
            if (ticketsOwner[msg.sender][i].length > 0) {
                uint256 groupTicketsCount = ticketsOwner[msg.sender][i].length;
                assembly {
                    mstore(add(ownedTickets, offset), i)
                    mstore(add(ownedTickets, add(offset, 32)), groupTicketsCount)
                }
                
                offset += 32;
                for (uint256 j = 0; j < ticketsOwner[msg.sender][i].length; j++) {
                    offset += 32;
                    uint256 ticketPrice = ticketsOwner[msg.sender][i][j];
                    assembly {
                        mstore(add(ownedTickets, offset), ticketPrice)
                    }
                }
            }
        }

        return ownedTickets;
    }
}
