pragma solidity ^0.4.2;

import './AccessRestricted.sol';
import './TimeStamping.sol';

contract Patenting is AccessRestricted {

    uint public patentPrice;
    uint patentCount;

    struct Patent {
        address patentOwner;
        uint timestamp;
        string patentName;
        string signature;
        uint price;
        mapping(address => uint) authorized;

    }

    mapping(string => Patent) patents;

    /* Constructor of the contract
    * {param} uint : The price for depositing a pattern in Wei
    */
    function TimeStamping(uint _patentPrice) public {
        patentPrice = _patentPrice;
    }

    /* Function to deposit a pattern
    * {params} the patent parameters
    * {costs} the price of a patent
    */
    function depositPatent(string _patentName, string _signature, string _patentHash, uint _price) public payable costs(patentPrice) {
        require(patents[_patentHash].timestamp == 0 );
        patents[_patentHash] = Patent(msg.sender, now, _patentName, _signature, _price);
        patentCount++;
    }


    function getPatent(string _patentHash) public view returns (string){
        Patent p = patents[_patentHash];
        require(p.timestamp != 0);
        uint deadline = p.authorized[msg.sender];
        require(deadline != 0 && deadline > now);
        return patents[_patentHash].signature;
    }

    function authorizeUser(string _patentHash, uint _time) public payable {
        require(patents[_patentHash].timestamp != 0);
        require(patents[_patentHash].price*_time <= msg.value);
        patents[_patentHash].authorized[msg.sender] = now + _time;
        patents[_patentHash].patentOwner.transfer(msg.value);
    }
}
