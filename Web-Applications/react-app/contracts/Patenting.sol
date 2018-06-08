pragma solidity ^0.4.2;

import './AccessRestricted.sol';
import './TimeStamping.sol';
import './FiatContract.sol';

contract Patenting is AccessRestricted {

    uint public patentPrice;
    uint public patentCount;

    enum RequestStatus {Not_requested, Pending, Rejected, Cancelled, Accepted}

    /*Struct for request */
    struct Request {
        RequestStatus status;
        uint deposit;
        string email;
        string encryptionKey;
        string encryptedIpfsKey;
    }

    /*Struct for patent*/
    struct Patent {
        address owner;
        uint timestamp;
        string patentHash;
        uint price;
        string ipfs;
        string email;
        uint numRequests;
        mapping(uint => address) buyers;
        mapping(address => Request) requests;
    }

    string[] public patentNames;
    mapping(string => Patent) private patents; //PatentName to struct

    event NewRequest(
        string _ownerMail,
        string _patentName,
        address _rentee
    );

    event RequestResponse(
        string _requesterEmail,
        string _patentName,
        bool _accepted
    );

    FiatContract fiat;

    /* Constructor of the contract
    * {param} uint : The price for depositing a pattern in Wei
    */
    function Patenting(uint _patentPrice, address _fiatContract) public {
        fiat = FiatContract(_fiatContract);
        patentPrice = _patentPrice;
    }

    function getEthPrice(uint _dollars) public view returns (uint) {
        return fiat.USD(0) * 100 * _dollars;
    }

    /* Function to deposit a pattern
    * {params} the patent parameters
    * {costs} the price of a patent
    */
    function depositPatent(string _patentName, string _patentHash, uint _price, string _ipfs, string _email) public payable {
        require(patents[_patentName].timestamp == 0 && msg.value >= getEthPrice(patentPrice));
        patents[_patentName] = Patent(msg.sender, now, _patentHash, _price, _ipfs, _email, 0);
        patentNames.push(_patentName);
        patentCount++;
    }

    /* Function to request access to a patent
    * {params} _patentName : name of patent
    *          _encryptionKey : key to encrypt AES key with (key exchange protocol)
    * {costs} price of the patent : will be frozen until request is accepted, rejected, or cancelled
    */
    function requestAccess(string _patentName, string _encryptionKey, string _email) public payable {
        uint ethPrice = getEthPrice(patents[_patentName].price);
        require(patents[_patentName].timestamp != 0 && canRequest(_patentName, msg.sender) && msg.value >= ethPrice);
        Patent storage p = patents[_patentName];
        if (p.requests[msg.sender].status == RequestStatus.Not_requested) {
            p.buyers[p.numRequests++] = msg.sender;
        }
        p.requests[msg.sender] = Request(RequestStatus.Pending, ethPrice, _email, _encryptionKey, "");
        NewRequest(patents[_patentName].email, _patentName, msg.sender);
    }

    function resendRequest(string _patentName) public payable {
        uint ethPrice = getEthPrice(patents[_patentName].price);
        require(patents[_patentName].timestamp != 0 && canRequest(_patentName, msg.sender) && msg.value >= ethPrice && !isNotRequested(_patentName, msg.sender));
        Request storage r = patents[_patentName].requests[msg.sender];
        r.status = RequestStatus.Pending;
        r.deposit = ethPrice;
    }

    /* Function to grant access to a user
    * {params} _patentName : name of patent
    *          _user : user to give access to (must have requested)
    *          _encryptedIpfsKey : encrypted AES key to decrypt file on ipfs
    *   Transfers the amount to the patent owner
    */
    function grantAccess(string _patentName, address _user, string _encryptedIpfsKey) public {
        require(patents[_patentName].timestamp != 0 && isOwner(_patentName, msg.sender) && isPending(_patentName, _user));
        Request storage r = patents[_patentName].requests[_user];
        require(r.deposit >= 0);
        msg.sender.transfer(r.deposit);
        r.deposit = 0;
        r.status = RequestStatus.Accepted;
        // Accept Request
        r.encryptedIpfsKey = _encryptedIpfsKey;
        RequestResponse(r.email, _patentName, true);
    }

    /* Function to reject access to a patent
    * {params} : Same as above
    * Refunds the amount to the user
    */
    function rejectAccess(string _patentName, address _user) public {
        require(patents[_patentName].timestamp != 0 && isOwner(_patentName, msg.sender) && isPending(_patentName, _user));
        Request storage r = patents[_patentName].requests[_user];
        require(r.deposit >= 0);
        _user.transfer(r.deposit);
        // Refund back to user
        r.deposit = 0;
        r.status = RequestStatus.Rejected;
        // Reject Request
        RequestResponse(r.email, _patentName, false);
    }

    /* Function that cancels a request (can only be called by user)
    * {params} : _patentName : name of patent
    */
    function cancelRequest(string _patentName) public {
        require(patents[_patentName].timestamp != 0 && !isOwner(_patentName, msg.sender) && isPending(_patentName, msg.sender));
        Request storage r = patents[_patentName].requests[msg.sender];
        require(r.deposit >= 0);
        msg.sender.transfer(r.deposit);
        r.deposit = 0;
        r.status = RequestStatus.Cancelled;
        // Cancel request
    }

    /*Allows the owner to withdraw the remaining funds*/
    function withdrawFunds() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    /*-----------------------------------View functions that do not require transactions-----------------------------------*/

    /*Returns true if the given account can request the given patent : is either Not_requested, cancelled or rejected*/
    function canRequest(string _patentName, address _account) public view returns (bool){
        return !(isPending(_patentName, _account) || isAccepted(_patentName, _account) || isOwner(_patentName, _account));
    }

    /*Returns the RequestStatus of the given patent for the given account*/
    function getRequestStatus(string _patentName, address _account) public view returns (RequestStatus){
        return patents[_patentName].requests[_account].status;
    }

    /*Returns true of the given account hasn't requested the given patent*/
    function isNotRequested(string _patentName, address _account) public view returns (bool){
        return patents[_patentName].requests[_account].status == RequestStatus.Not_requested;
    }

    /*Returns true of the given account has a pending request on the given patent*/
    function isPending(string _patentName, address _account) public view returns (bool){
        return patents[_patentName].requests[_account].status == RequestStatus.Pending;
    }

    /*Verifies that the given address has been accepted for the given patent*/
    function isAccepted(string _patentName, address _account) public view returns (bool){
        return patents[_patentName].requests[_account].status == RequestStatus.Accepted;
    }

    /*Returns true if account is owner of given patent*/
    function isOwner(string _patentName, address _account) public view returns (bool){
        return getPatentOwner(_patentName) == _account;
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

    /*Returns the number of requests for the given patent*/
    function getNumRequests(string _patentName) public view returns (uint){
        return patents[_patentName].numRequests;
    }

    /*Returns the address of the buyer at _index  (Used for iterating)*/
    function getBuyers(string _patentName, uint _index) public view returns (address){
        return patents[_patentName].buyers[_index];
    }

    /*Returns the requester's public key*/
    function getEncryptionKey(string _patentName, address _user) public view returns (string){
        require(msg.sender == patents[_patentName].owner);
        return patents[_patentName].requests[_user].encryptionKey;
    }

    /*Returns the encrypted IPFS encryption key*/
    function getEncryptedIpfsKey(string _patentName) public view returns (string){
        require(isAccepted(_patentName, msg.sender));
        return patents[_patentName].requests[msg.sender].encryptedIpfsKey;
    }

    function getOwnerEmail(string _patentName) public view returns (string) {
        return patents[_patentName].email;
    }

    /*Returns the IPFS location of the patent*/
    function getPatentLocation(string _patentName) public view returns (string) {
        return patents[_patentName].ipfs;
    }
}
