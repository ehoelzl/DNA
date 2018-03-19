pragma solidity ^0.4.21;

contract CrowdFund {

  address public beneficiary;
  uint256 public goal;
  uint256 public deadline;

  //Mapping is faster in array
  //Any address that is not in the mapping will give  result of 0 when queried
  mapping(address => uint256) public funders;
  address[] funderAddresses;

  //To write an even to chain data (Less expensive than sate trie)
  //To be able to know when an event happened from outside the chain
  //Keyword 'indexed' is used to be able to listen to one specific value of that field
  event NewContribution(address indexed _from, uint256 _value);

  function CrowdFund(address _beneficiary, uint256 _goal, uint256 _duration) public payable {
    beneficiary = _beneficiary;
    goal = _goal;
    deadline = _duration + now;
  }

  function getFunderContribution(address _addr) public constant returns (uint256){
    return funders[_addr];
  }

  function funderAddress(uint _index) public constant returns (address) {
    return funderAddresses[_index];
  }

  function funderAddressLength() public constant returns (uint) {
    return funderAddresses.length;
  }

  function contribute() payable public {
    if(funders[msg.sender] == 0) funderAddresses.push(msg.sender);
    funders[msg.sender] += msg.value;
    emit NewContribution(msg.sender, msg.value);
  }

  function payout() public {
    if(this.balance >= goal && now > deadline) beneficiary.transfer(this.balance);
  }

  function refund() public payable{
    if (now > deadline && this.balance < goal) {
      msg.sender.transfer(funders[msg.sender]);
      funders[msg.sender] = 0;
    }


  }
}
