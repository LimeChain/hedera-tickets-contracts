pragma solidity 0.6.7;

contract BinaryOrdering {


    mapping(uint256 => uint256) numbers;
    { 1, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 0, 92, 0, 0, 0 }
    
    mappingLength = 3
    smallest -> pointer to 1
    number.pop() => 1 
    mappingLength = 2
    => { 0, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 0, 92, 0, 0, 0 }
    => 

    StackQueue

    pop push

    -> 1, 3 <- 

         | 
         2
    -> 1 , 3 <-
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    uint256[] public prices;

    function add(uint256 newPrice){
        assembly {
            sstore(keccak256(uint256(newPrice)), newPrice);
        }
    }

    function getElement() public view return(uint256){
        assembly {
            result:= sload(0)
        }

        return result;
    }
}
