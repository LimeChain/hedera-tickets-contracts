pragma solidity 0.6.7;


// Implement Queue
library LinkedList {
    struct Node {
        uint256 value;
        uint256 prev;
        uint256 next;
    }

    struct Storage {
        uint256 length;
        Node midNode;
        Node endNode;
        mapping(uint256 => Node) nodes;
    }

    function add(Storage storage self, uint256 value) public {
        if (self.length == 0) {
            setFirstNode(self, value);
        } else if (self.nodes[0].value > value) {
            addOnStart(self, value);
        } else if (self.endNode.value < value) {
            addOnEnd(self, value);
        } else {
            addInBetween(self, value);
        }

        self.length++;
    }

    function setFirstNode(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node({value: value, prev: value, next: value});

        self.nodes[0] = self.nodes[value];
        self.midNode = self.nodes[value];
        self.endNode = self.nodes[value];
    }

    function addOnStart(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node({
            value: value,
            prev: value,
            next: self.nodes[0].value
        });
        self.nodes[self.nodes[0].value].prev = value;
        self.nodes[0] = self.nodes[value];
    }

    function addOnEnd(Storage storage self, uint256 value) internal {
        self.nodes[value] = Node({
            value: value,
            prev: self.endNode.value,
            next: value
        });
        self.nodes[self.endNode.value].next = value;
        self.endNode = self.nodes[value];
    }

    function addInBetween(Storage storage self, uint256 value) internal {
        uint256 index = placeToAdd(self, value);

        self.nodes[value] = Node({
            value: value,
            prev: index,
            next: self.nodes[index].next
        });

        self.nodes[index].next = value;
        self.nodes[self.nodes[value].next].prev = value;
    }

    function placeToAdd(Storage storage self, uint256 value)
        internal
        returns (uint256)
    {
        if (self.midNode.value < value) {
            uint256 nextNode = self.midNode.next;
            while (self.nodes[nextNode].value < value) {
                if (self.midNode.value == self.midNode.next) break;
                nextNode = self.nodes[nextNode].next;
            }

            self.midNode.prev = self.midNode.value;
            self.midNode.value = self.nodes[self.midNode.next].value;
            return self.nodes[nextNode].prev;
        } else if (self.midNode.value > value) {
            uint256 prevNode = self.midNode.prev;
            while (self.nodes[prevNode].prev > value) {
                if (self.midNode.value == self.midNode.prev) break;
                prevNode = self.nodes[prevNode].prev;
            }

            self.midNode.next = self.midNode.value;
            self.midNode.value = self.nodes[self.midNode.prev].value;
            return self.nodes[prevNode].next;
        }
    }

    // Todo: Move mid left
    function popHead(Storage storage self) public {
        uint256 nextHeadNode = self.nodes[0].next;
        delete self.nodes[self.nodes[0].value];

        self.nodes[nextHeadNode].prev = nextHeadNode;
        self.nodes[0] = self.nodes[nextHeadNode];
    }
}
