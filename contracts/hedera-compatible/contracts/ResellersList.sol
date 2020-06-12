pragma solidity 0.6.7;

import "./../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract ResellersList is Ownable {
    struct Queue {
        uint256 first;
        uint256 length;
        address[] all;
    }

    struct Node {
        uint256 value;
        uint256 prev;
        uint256 next;
        Queue resellers;
    }

    struct Storage {
        uint256 startNode;
        uint256 midNode;
        uint256 endNode;
        uint256 length;
        mapping(uint256 => Node) nodes;
    }
    Storage public list;

    function add(uint256 value, address reseller) external onlyOwner {
        if (list.nodes[value].value != value) {
            if (list.length == 0) {
                setFirstNode(value);
            } else if (list.startNode > value) {
                addOnStart(value);
            } else if (list.endNode < value) {
                addOnEnd(value);
            } else {
                addInBetween(value);
            }

            list.length++;
        }

        list.nodes[value].resellers.length++;
        list.nodes[value].resellers.all.push(reseller);
    }

    function setFirstNode(uint256 value) internal {
        list.nodes[value] = Node(
            value,
            value,
            value,
            Queue(0, 0, new address[](0))
        );

        list.startNode = value;
        list.midNode = value;
        list.endNode = value;
    }

    function addOnStart(uint256 value) internal {
        list.nodes[value] = Node(
            value,
            value,
            list.startNode,
            Queue(0, 0, new address[](0))
        );
        list.nodes[list.startNode].prev = value;
        list.startNode = value;

        moveMidNode(list.nodes[list.midNode].prev);
    }

    function addOnEnd(uint256 value) internal {
        list.nodes[value] = Node(
            value,
            list.endNode,
            value,
            Queue(0, 0, new address[](0))
        );
        list.nodes[list.endNode].next = value;
        list.endNode = value;

        moveMidNode(list.nodes[list.midNode].next);
    }

    function addInBetween(uint256 value) internal {
        if (list.nodes[list.midNode].value < value) {
            forwardPosition(value);
            list.nodes[list.nodes[value].prev].next = value;
            list.nodes[list.nodes[value].next].prev = value;
            moveMidNode(list.nodes[list.midNode].next);
        } else if (list.nodes[list.midNode].value > value) {
            backwardPosition(value);
            list.nodes[list.nodes[value].prev].next = value;
            list.nodes[list.nodes[value].next].prev = value;
            moveMidNode(list.nodes[list.midNode].prev);
        }
    }

    function forwardPosition(uint256 value) internal returns (uint256) {
        if (list.nodes[list.midNode].value == list.nodes[list.midNode].next) {
            return list.midNode;
        }

        uint256 nextNode = list.nodes[list.midNode].next;
        while (list.nodes[nextNode].value < value) {
            nextNode = list.nodes[nextNode].next;
        }

        list.nodes[value] = Node(
            value,
            list.nodes[nextNode].prev,
            nextNode,
            Queue(0, 0, new address[](0))
        );
    }

    function backwardPosition(uint256 value) internal returns (uint256) {
        if (list.nodes[list.midNode].value == list.nodes[list.midNode].prev) {
            return list.midNode;
        }

        uint256 prevNode = list.nodes[list.midNode].prev;
        while (list.nodes[prevNode].value > value) {
            prevNode = list.nodes[prevNode].prev;
        }

        list.nodes[value] = Node(
            value,
            prevNode,
            list.nodes[prevNode].next,
            Queue(0, 0, new address[](0))
        );
    }

    function popHead() external onlyOwner {
        if (list.nodes[list.startNode].resellers.length == 1) {
            if (list.length > 1) {
                uint256 nextHeadNode = list.nodes[list.startNode].next;

                delete list.nodes[list.startNode];
                list.startNode = nextHeadNode;

                list.nodes[nextHeadNode].prev = nextHeadNode;
                moveMidNode(list.nodes[list.midNode].next);
            } else {
                delete list.nodes[list.startNode];
                list.startNode = 0;
            }

            list.length--;
        } else {
            Queue storage resellers = list.nodes[list.startNode].resellers;
            delete resellers.all[resellers.first];
            resellers.first++;
            resellers.length--;
        }
    }

    function moveMidNode(uint256 position) internal {
        if (list.length % 2 == 0) {
            list.midNode = position;
        }
    }

    // Getters
    function length() external view returns (uint256) {
        return list.length;
    }

    function getNodeAt(uint256 position)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            list.nodes[position].value,
            list.nodes[position].prev,
            list.nodes[position].next
        );
    }

    function getFirstReseller(uint256 node) external view returns (address) {
        uint256 index = list.nodes[node].resellers.first;
        return list.nodes[node].resellers.all[index];
    }

    function getNodeResellersData(uint256 node)
        external
        view
        returns (uint256, uint256)
    {
        return (
            list.nodes[node].resellers.first,
            list.nodes[node].resellers.length
        );
    }

    function getHead() external view returns (uint256) {
        return list.startNode;
    }

    function getMidNode() external view returns (uint256) {
        return list.midNode;
    }

    function getEndNode() external view returns (uint256) {
        return list.endNode;
    }
}
