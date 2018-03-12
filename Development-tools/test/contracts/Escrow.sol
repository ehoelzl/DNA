pragma solidity ^0.4.20;
contract Escrow {

  //Public addresses, public term automatically adds getter methods
  address public buyer;
  address public seller;
  address public arbiter;

  //Constructor, can take in parameters
  function Escrow(address _seller, address _arbiter) payable {
    //Message object (msg already built in) : info about transaction calling the contract
    buyer = msg.sender;
    seller = _seller;
    arbiter = _arbiter;
  }

  function payoutToSeller() public {
    if (msg.sender == buyer || msg.sender == arbiter) {
      seller.send(this.balance);
    }
  }

  function payoutToBuyer() public{
    if (msg.sender == seller || msg.sender == arbiter) {
      buyer.send(this.balance);
    }
  }

  function getBalance() constant public returns (uint){
    return this.balance;
  }
}
