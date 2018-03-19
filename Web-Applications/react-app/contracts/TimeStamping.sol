pragma solidity ^0.4.0;

import './AccessRestricted.sol';

contract TimeStamping is AccessRestricted{

    struct Stamp {
        address user;
        uint timestamp;
    }

    mapping(string => Stamp) timestamps;
    uint public price;

    uint public stampCount;

    function TimeStamping(uint _price) public {
        price = _price;
        stampCount = 0;
    }

    //Withdraw funds only by owner
    function withdrawFunds() public onlyOwner {
        address thisAddress = this;
        owner.transfer(thisAddress.balance);
    }

    //For simple donations
    function () public payable{

    }

    function stamp(string _hash) public payable costs(price){
        require(msg.sender != owner);
        stampHash(_hash, msg.sender);
    }

    function ownerStamp(string _hash) public payable onlyOwner {
        stampHash(_hash, msg.sender);
    }

    function stampHash(string _hash, address user) private {
        require(timestamps[_hash].timestamp == 0);
        timestamps[_hash] = Stamp(user, now);
        stampCount++;
    }


    function getTimestamp(string _hash) public view returns (uint){
        return timestamps[_hash].timestamp;
    }

    function getUser(string _hash) public view returns (address){
        return timestamps[_hash].user;
    }
}
