pragma solidity ^0.4.0;

contract AccessRestricted {

    address public owner = msg.sender;


    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }



    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    modifier costs(uint price) {
        require(msg.value >= price);

        if (msg.value > price){
            msg.sender.transfer(msg.value - price);
        }
        _;
    }

}
