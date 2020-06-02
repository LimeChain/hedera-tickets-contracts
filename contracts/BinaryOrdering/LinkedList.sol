pragma solidity 0.6.7;

library BinaryOrdering {

    modifier onlyExistingNode(Data storage self, address userAddress) {
        Node storage currentNode = self.nodes[userAddress];
        require(currentNode.nodeValue != 0x0);

        _;
    }

    modifier notSingleNode(Data storage self) {
        require(self.linkedListLength >= 2);

        _;
    }

    modifier notLastNode(Data storage self, address userAddress) {
        Node storage currentNode = self.nodes[userAddress];
        require(currentNode.nextNode != 0x0);

        _;
    }

    struct Node {
        address nodeValue; 
        address previousNode;
        address nextNode;
    }

    struct Data {
        address head;
        address tail;
        uint256 linkedListLength;
        mapping (address => Node) nodes;
    }

    function isSingleNodeList(Data storage self) public view returns(bool) {
        return self.linkedListLength <= 2;
    }

    function add(Data storage self, address userAddress) public {
        require(userAddress != address(0));
        
        if (self.linkedListLength == 0) {
            Node memory firstNode = Node({
                nodeValue: userAddress,
                previousNode: address(0),
                nextNode: address(0)
            });
            
            self.nodes[userAddress] = firstNode;
            self.head = userAddress;
            self.linkedListLength += 1;
        } else {
            Node storage previousNode = self.nodes[self.tail];
            previousNode.nextNode = userAddress;

            Node memory currentNode = Node({
                nodeValue: userAddress,
                previousNode: self.tail,
                nextNode: address(0)
            });

            self.nodes[userAddress] = currentNode;
            self.linkedListLength += 1;
        }

        self.tail = userAddress;
    }

    function moveToEnd(Data storage self, address userAddress) public onlyExistingNode(self, userAddress) notSingleNode(self) notLastNode(self, userAddress) {
        require(userAddress != address(0));

        Node storage currentNode = self.nodes[userAddress];

        if (currentNode.previousNode == address(0)) {
            self.head = self.nodes[currentNode.nextNode].nodeValue;
            self.nodes[currentNode.nextNode].previousNode = address(0);
            self.nodes[self.tail].nextNode = userAddress;
            currentNode.previousNode = self.tail;
        } else {
            self.nodes[currentNode.previousNode].nextNode = currentNode.nextNode;
            self.nodes[currentNode.nextNode].previousNode = currentNode.previousNode;
            self.nodes[self.tail].nextNode = userAddress;
        }

        currentNode.nextNode = address(0);
        self.tail = userAddress;
    }
}
