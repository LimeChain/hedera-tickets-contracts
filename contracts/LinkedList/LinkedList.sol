pragma solidity 0.6.7;


// Implement Queue
library LinkedList {
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

    function add(
        Storage storage self,
        uint256 value,
        address reseller
    ) public {
        if (self.nodes[value].value != value) {
            if (self.length == 0) {
                setFirstNode(self, value);
            } else if (self.startNode > value) {
                addOnStart(self, value);
            } else if (self.endNode < value) {
                addOnEnd(self, value);
            } else {
                addInBetween(self, value);
            }

            self.length++;
        }

        self.nodes[value].resellers.length++;
        self.nodes[value].resellers.all.push(reseller);
    }

    function setFirstNode(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node(
            value,
            value,
            value,
            Queue(0, 0, new address[](0))
        );

        self.startNode = value;
        self.midNode = value;
        self.endNode = value;
    }

    function addOnStart(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node(
            value,
            value,
            self.startNode,
            Queue(0, 0, new address[](0))
        );
        self.nodes[self.startNode].prev = value;
        self.startNode = value;

        moveMidNode(self, self.nodes[self.midNode].prev);
    }

    function addOnEnd(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node(
            value,
            self.endNode,
            value,
            Queue(0, 0, new address[](0))
        );
        self.nodes[self.endNode].next = value;
        self.endNode = value;

        moveMidNode(self, self.nodes[self.midNode].next);
    }

    function addInBetween(Storage storage self, uint256 value) internal {
        if (self.nodes[self.midNode].value < value) {
            forwardPosition(self, value);
            self.nodes[self.nodes[value].prev].next = value;
            self.nodes[self.nodes[value].next].prev = value;
            moveMidNode(self, self.nodes[self.midNode].next);
        } else if (self.nodes[self.midNode].value > value) {
            backwardPosition(self, value);
            self.nodes[self.nodes[value].prev].next = value;
            self.nodes[self.nodes[value].next].prev = value;
            moveMidNode(self, self.nodes[self.midNode].prev);
        }
    }

    function forwardPosition(Storage storage self, uint256 value)
        internal
        returns (uint256)
    {
        if (self.nodes[self.midNode].value == self.nodes[self.midNode].next) {
            return self.midNode;
        }

        uint256 nextNode = self.nodes[self.midNode].next;
        while (self.nodes[nextNode].value < value) {
            nextNode = self.nodes[nextNode].next;
        }

        self.nodes[value] = Node(
            value,
            self.nodes[nextNode].prev,
            nextNode,
            Queue(0, 0, new address[](0))
        );
    }

    function backwardPosition(Storage storage self, uint256 value)
        internal
        returns (uint256)
    {
        if (self.nodes[self.midNode].value == self.nodes[self.midNode].prev) {
            return self.midNode;
        }

        uint256 prevNode = self.nodes[self.midNode].prev;
        while (self.nodes[prevNode].value > value) {
            prevNode = self.nodes[prevNode].prev;
        }

        self.nodes[value] = Node(
            value,
            prevNode,
            self.nodes[prevNode].next,
            Queue(0, 0, new address[](0))
        );
    }

    function popHead(Storage storage self) public {
        if (self.nodes[self.startNode].resellers.length == 1) {
            if (self.length > 1) {
                uint256 nextHeadNode = self.nodes[self.startNode].next;
                self.nodes[nextHeadNode].prev = nextHeadNode;
                self.startNode = nextHeadNode;
                moveMidNode(self, self.nodes[self.midNode].next);
            } else {
                self.startNode = 0;
            }

            delete self.nodes[self.startNode];
        } else {
            Queue storage resellers = self.nodes[self.startNode].resellers;
            delete resellers.all[resellers.first];
            resellers.first++;
            resellers.length--;
        }
    }

    function moveMidNode(Storage storage self, uint256 position) internal {
        if (self.length % 2 == 0) {
            self.midNode = position;
        }
    }
}
