pragma solidity 0.6.7;

import {LinkedList} from "./LinkedList.sol";


contract LinkedContract {
    using LinkedList for LinkedList.Storage;
    LinkedList.Storage linkedList;

    function add(uint256 value) external {
        linkedList.add(value);
    }

    function popHead() external {
        linkedList.popHead();
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
            linkedList.nodes[position].value,
            linkedList.nodes[position].prev,
            linkedList.nodes[position].next
        );
    }

    function getHead() external view returns (uint256) {
        return linkedList.nodes[0].value;
    }

    function getMidNode() external view returns (uint256) {
        return linkedList.midNode.value;
    }

    function getEndNode() external view returns (uint256) {
        return linkedList.endNode.prev;
    }
}
