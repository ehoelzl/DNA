pragma solidity ^0.4.2;

import './AccessRestricted.sol';
import './TimeStamping.sol';

contract Patenting is AccessRestricted {

    uint public patentPrice;
    uint public patentCount;

    struct Patent {
        address owner;
        uint timestamp;
        string patentHash;
        uint price;
        string ipfs;
        mapping(address => uint) authorized;

    }


    string[] public patentNames;
    mapping(string => Patent) private patents; //PatentName to struct

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
        require(patents[_patentName].timestamp == 0);
        patents[_patentName] = Patent(msg.sender, now, _patentHash, _price, _ipfs);
        patentNames.push(_patentName);
        patentCount++;
    }

    function rentPatent(string _patentName, uint _daysAfter) public payable returns (bool){
        require(patents[_patentName].authorized[msg.sender] == 0 && msg.value >= patents[_patentName].price);
        patents[_patentName].authorized[msg.sender] = now + _daysAfter * 1 days;
        patents[_patentName].owner.transfer(msg.value);
        return true;
    }

    /*-----------------------------------View functions that do not require transactions-----------------------------------*/


    function getTimeStamp(string _patentName) public view returns (uint){
        return patents[_patentName].timestamp;
    }

    function getRemainingTime(string _patentName, address _user) public view returns (uint){
        return patents[_patentName].authorized[_user] - now ;
    }
    function getPatentHash(string _patentName) public view returns (string){
        return patents[_patentName].patentHash;
    }

    function getPatentOwner(string _patentName) public view returns (address) {
        return patents[_patentName].owner;
    }

    function getRentalPrice(string _patentName) public view returns (uint){
        return patents[_patentName].price;
    }
    function getPatentLocation(string _patentName) public view returns (string) {
        require(patents[_patentName].authorized[msg.sender] > now || msg.sender == patents[_patentName].owner);
        return patents[_patentName].ipfs;
    }



}
