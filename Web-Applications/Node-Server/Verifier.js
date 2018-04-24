const sha256 = require('sha256');

const NO_MATCH = 'SIgnature does not match';
const CORRUPTED = 'Data is corrupted';
const NOT_FOUND = "No timestamp found in Database";

/*This class Helps verify the signature of a document and get the timestamp from the smart contract*/
class Verifier {
  constructor(contractInstance_) {
    this.contractInstance = contractInstance_;
  }

  /* Function that takes in a hash and returns the root of the tree generated with the given proof path
  * Throws an error if the proof did not work
  * */
  static getRootFromProof(hash, email, proofPath) {
    let levels = proofPath.length;
    if (levels === 0) {
      return hash;
    }

    let current = sha256(hash+email);
    for (let i = 0; i < levels; i++) {
      let left = proofPath[i]['left'];
      let right = proofPath[i]['right'];
      if (!(current === left || current === right)) {
        throw Error(NO_MATCH);
      } else {
        current = sha256(left + right);
      }
    }
    return current
  }

  /*Function that verifies that the hash and the signature are timestamped
  *
  * Returns : A promise that resolves into the timestamp
  */
  getTimestamp(json) {
    let hash, signature, email;

    try {
      hash = json['hash'];
      signature = json['signature'];
      email = signature.pop()['email'];
    } catch (error) {
      throw Error(CORRUPTED)
    }

    console.log("verifying hash " + hash);

    let root = Verifier.getRootFromProof(hash,email, signature);
    console.log('Found root ' + root);
    return [this.contractInstance.getTimestamp.call(root), email];
  }

  /*Static function that returns the response depending on the resulting timestamp*/
  static getResponse(stamp, email) {
    let response;
    if (stamp === 0) {
      response = [400, NOT_FOUND]
    } else {
      let data = {'email' : email, 'stamp' : stamp.toString()};
      response = [200, JSON.stringify(data)];
    }

    return response;
  }

}

module.exports = Verifier;