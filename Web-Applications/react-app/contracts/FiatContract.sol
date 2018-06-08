pragma solidity ^0.4.2;

contract FiatContract {

    function ETH(uint _id) constant public returns (uint256);
    function USD(uint _id) constant public returns (uint256);
    function EUR(uint _id) constant public returns (uint256);
    function GBP(uint _id) constant public returns (uint256);
    function updatedAt(uint _id) public constant returns (uint);

}
