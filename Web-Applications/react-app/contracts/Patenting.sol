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
        string email;
        //string key; TODO : Potentially add key to secure the file on IPFS
        mapping(address => bool) authorized;
    }

    string[] public patentNames;
    mapping(string => Patent) private patents; //PatentName to struct

    event NewRental(
        string _ownerMail,
        string _patentName,
        address _rentee
    );

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
    function depositPatent(string _patentName, string _patentHash, uint _price, string _ipfs, string _email) public payable costs(patentPrice) {
        require(patents[_patentName].timestamp == 0);
        patents[_patentName] = Patent(msg.sender, now, _patentHash, _price, _ipfs, _email);
        patentNames.push(_patentName);
        patentCount++;
    }

    function buyPatent(string _patentName) public payable {
        require(!isAuthorized(_patentName, msg.sender) && msg.value >= patents[_patentName].price);
        patents[_patentName].authorized[msg.sender] = true; //Authorize sender
        patents[_patentName].owner.transfer(patents[_patentName].price); //Send funds to patent owner
        NewRental(patents[_patentName].email, _patentName, msg.sender); //Emit new event for email
    }

    /*Allows the owner to withdraw the remaining funds*/
    function withdrawFunds() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    /*-----------------------------------View functions that do not require transactions-----------------------------------*/

    /*Verifies that the given address is authorized for the given patent*/
    function isAuthorized(string _patentName, address _account) public view returns (bool){
        return patents[_patentName].authorized[_account] || getPatentOwner(_patentName) == _account;
    }

    /*Returns time-stamp of the Patent*/
    function getTimeStamp(string _patentName) public view returns (uint){
        return patents[_patentName].timestamp;
    }

    /*Returns the sha256 hash of the patent*/
    function getPatentHash(string _patentName) public view returns (string){
        return patents[_patentName].patentHash;
    }

    /*Returns patent's owner*/
    function getPatentOwner(string _patentName) public view returns (address) {
        return patents[_patentName].owner;
    }

    /*Returns the price of a patent*/
    function getPrice(string _patentName) public view returns (uint){
        return patents[_patentName].price;
    }

    /*Returns the IPFS location of the patent*/
    function getPatentLocation(string _patentName) public view returns (string) {
        require(isAuthorized(_patentName, msg.sender));
        return patents[_patentName].ipfs;
    }
}
