const Merkle = require('merkle');
const crypto = require('crypto');
const mailer = require('./Mail-server');

/*This class helps accumulate the timestamps, create the merkle tree and send the signatures to the users and the root to the contract*/
class Timestamper {

  constructor(contractInstance_, address_, hashLimit_, timeLimit_) {
    this.contractInstance = contractInstance_;
    this.hashLimit = hashLimit_;
    this.timeLimit = timeLimit_;
    this.address = address_;
    this.hashList = [];
    this.hashToMail = new Map();
  }

  /*Resets the state*/
  reset() {
      //if(this.hashList.length > 0) {
          let root = this.sendSignatures();
          this.contractStamp(root);
          this.hashList = [];
          this.hashToMail = new Map();
      //}
  }

  /*Sends the root of the Merkle tree to the contract*/
  contractStamp(root) {
    this.contractInstance.ownerStamp(root, {
      from: this.address,
      gas: 100000
    }).then(tx => {
      console.log('Successful ' + tx.tx);
    }).catch(e => console.log('Error ' + e))
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
      this.hashList.push(hash);
      this.hashToMail.set(hash, email);
      response = [200, 'Hash successfully submitted'];
      console.log('Hash ' + hash + ' submitted for user ' + email)
    } else if (this.hashToMail.get(hash) === email) {
      response = [200, 'Hash already submitted by user']
    } else {
      response = [200, 'Hash already submitted by another user']
    }

    if (this.hashList.length === this.hashLimit) {
      this.reset()
    }

    return response;
  }

  /*Function that generates and sends signatures to the corresponding user
  * Returns : The root of the generated tree
  * */
  sendSignatures() {
    let n_hashes = this.hashList.length;

    for (let i = n_hashes; i < this.hashLimit; i++) {
      this.hashList.push(crypto.randomBytes(32).toString('hex'));
    }

    let merkleTree = Merkle('sha256', false).sync(this.hashList);
    console.log("Merkle Tree created with root:", merkleTree.root());

    for (let i = 0; i < n_hashes; i++) {
      let h = this.hashList[i];
      mailer.send(h, merkleTree.getProofPath(i, true), this.hashToMail.get(h));
      console.log('Send signature to ', this.hashToMail.get(h))
    }
    return merkleTree.root()
  }
}

module.exports = Timestamper;