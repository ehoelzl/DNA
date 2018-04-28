const Merkle = require('merkle');
const crypto = require('crypto');
const mailer = require('./Mail-server');

/*This class helps accumulate the timestamps, create the merkle tree and send the signatures to the users and the root to the contract*/
class Timestamper {

  constructor(contractInstance_, address_, hashLimit_, timeLimit_, minHashLimit_ = 1) {
    this.contractInstance = contractInstance_;
    this.hashLimit = hashLimit_;
    this.timeLimit = timeLimit_;
    this.address = address_;
    this.minHashLimit = minHashLimit_;
    this.hashList = [];
    this.timer = null;
    this.hashToMail = new Map();
  }


  /*Resets the state*/
  reset() {
    if (this.hashList.length > 0){
      let tree = this.constructTree();
      this.contractStamp(tree.root()).then(tx => { //Modified this so that we are sure the root is stored before sending the mails
        this.sendSignatures(tree);
        console.log('Successful timestamping ' + tx.tx);
        this.hashList = [];
        this.hashToMail = new Map();
      }).catch(e => console.log('Error while timestamping ' + e))

    }
  }



  /*Sends the root of the Merkle tree to the contract and returns a promise */
  contractStamp(root) {
    return this.contractInstance.ownerStamp(root, {
      from: this.address,
      gas: 100000
    })
  }

  /*Function that adds a hash to the queue from the json
  * Calls the sendSignatures method when the queue is full
  * Returns : The response message to send back to the client
  */
  addTimestamp(json) {
    let email, hash, response;
    email = json['email'];
    hash = json['hash'];

    if (!this.hashList.includes(hash)) {
      this.hashList.push(hash+email);
      this.hashToMail.set(hash+email, email);
      response = [200, 'Hash successfully submitted'];
      console.log('Hash ' + hash + ' submitted for user ' + email)
    } else if (this.hashToMail.get(hash) === email) {
      response = [400, 'Hash already submitted by user'] //TODO : change status codes
    } else {
      response = [400, 'Hash already submitted by another user']
    }

    if (this.hashList.length === this.hashLimit) {
      clearTimeout(this.timer); //Clear the timer if we attain hash limit
      this.reset()
    } else if (this.hashList.length === this.minHashLimit) {
      this.timer = setTimeout(() => this.reset(), this.timeLimit*60000) //Set a timer when we get the min number of hashes, to avoid people waiting hours
    }


    return response;
  }


  constructTree(){
    let n_hashes = this.hashList.length;

    let completeTree = [];
    for (let i = n_hashes; i < this.hashLimit; i++) {
      completeTree.push(crypto.randomBytes(32).toString('hex'));
    }

    let merkleTree = Merkle('sha256', false).sync(this.hashList.concat(completeTree));
    console.log("Merkle Tree created with root:", merkleTree.root());

    return merkleTree
  }

  /*Function that generates and sends signatures to the corresponding user
  * Returns : The root of the generated tree
  * */
  sendSignatures(merkleTree) {
    let n_hashes = this.hashList.length;

    for (let i = 0; i < n_hashes; i++) {
      let h = this.hashList[i];
      mailer.send(h, merkleTree.getProofPath(i, true), this.hashToMail.get(h));
      console.log('Send signature to ', this.hashToMail.get(h))
    }
    return merkleTree.root()
  }
}

module.exports = Timestamper;