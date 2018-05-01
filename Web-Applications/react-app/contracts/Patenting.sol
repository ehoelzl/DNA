pragma solidity ^0.4.2;

import './AccessRestricted.sol';
import './TimeStamping.sol';

contract Patenting is AccessRestricted {

    uint public patentPrice;
    uint public patentCount;

    struct Patent {
        address owner;
        uint timestamp;
        string patentName;
        uint price;
        string ipfs;
        mapping(address => uint) authorized;

    }

    event UnlockPatent(address _user, string _patentHash, uint duration);
    event LockPatent(address _user, string _patentHash);

    mapping(string => Patent) private patents;

    /* Constructor of the contract
    * {param} uint : The price for depositing a pattern in Wei
    */
    function Patenting(uint _patentPrice) public {
        patentPrice = _patentPrice;
    }

    /* Function to deposit a pattern
    * {params} the patent parameters
    * {costs} the price of a patent
    */
    function depositPatent(string _patentName, string _patentHash, uint _price, string _ipfs) public payable costs(patentPrice) {
        require(patents[_patentHash].timestamp == 0);
        patents[_patentHash] = Patent(msg.sender, now, _patentName,_price *1 ether, _ipfs);
        patentCount++;
    }

    function rentPatent(string _patentHash, uint _daysAfter) public payable returns (bool){
        require(patents[_patentHash].authorized[msg.sender] == 0 && msg.value >= patents[_patentHash].price);
        patents[_patentHash].authorized[msg.sender] = now + _daysAfter * 1 days;
        patents[_patentHash].owner.transfer(msg.value);
        return true;
    }

    /*-----------------------------------View functions that do not require transactions-----------------------------------*/


    function getTimeStamp(string _patentHash) public view returns (uint){
        return patents[_patentHash].timestamp;
    }

    function getRemainingTime(string _patentHash, address _user) public view returns (uint){
        return patents[_patentHash].authorized[_user] - now ;
    }
    function getPatentName(string _patentHash) public view returns (string){
        return patents[_patentHash].patentName;
    }

    function getPatentOwner(string _patentHash) public view returns (address) {
        return patents[_patentHash].owner;
    }

    function getRentalPrice(string _patentHash) public view returns (uint){
        return patents[_patentHash].price;
    }
    function getPatentLocation(string _patentHash) public view returns (string) {
        require(patents[_patentHash].authorized[msg.sender] > now);
        return patents[_patentHash].ipfs;
    }



}
