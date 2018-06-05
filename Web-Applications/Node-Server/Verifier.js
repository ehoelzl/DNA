const sha256 = require('sha256');
const constants = require('./utils');
const utils = constants.utils;

const contract = require('truffle-contract');
const TimeStamping_abi = require('../react-app/build/contracts/TimeStamping.json');
const timeStamping = contract(TimeStamping_abi);

/**
 * Verify the signature of a document and get the corresponding timestamp from the smart contract
 */
class Verifier {

    /**
     *
     * @param provider_
     */
    constructor(provider_) {
        timeStamping.setProvider(provider_);
        timeStamping.deployed().then(instance => {
            this.contractInstance = instance
        });
    }

    /**
     *
     * @param hash: The hash of the document to be verified
     * @param email: Email address of the user that is verifying his document
     * @param proofPath: The signature that is used to do the verification
     * @returns {Hash}: The root that has been computed from the signature
     *
     * Function that takes in a hash and returns the computed root of the tree generated with the given proof path.
     * For more informations about the computations, see ......................
     */
    getRootFromProof(hash, email, proofPath) {
        let levels = proofPath.length;
        if (levels === 0) {
            return hash;
        }

        let current = sha256(hash+email);
        for (let i = 0; i < levels; i++) {
            let left = proofPath[i]['left'];
            let right = proofPath[i]['right'];
            if (!(current === left || current === right)) {
                throw Error(constants.NO_MATCH);
            }
            else {
                current = sha256(left + right);
            }
        }
        return current
    }

    /**
     *
     * @param json: A JSON object containing the informations used for the verification
     *              (hash, signature, and email address)
     * @returns {*[]}: The response for the server
     *
     * Check that the hash and the signature are timestamped
     */
    getTimestamp(json) {

        if (!(utils.isSignature(json['signature']) && utils.isHash(json['hash']))) {
            throw Error(constants.CORRUPTED);
        }
        let hash = json['hash'];
        let signature = JSON.parse(json['signature']);
        let email = signature.pop()['email'];

        console.log("verifying hash " + hash);
        let root = this.getRootFromProof(hash, email, signature);
        console.log('Found root: ' + root);
        return [this.contractInstance.getTimestamp.call(root), email];

    }

  /*Static function that returns the response depending on the resulting timestamp*/
  static getResponse(stamp, email) {
    let data = {'email' : email, 'stamp' : stamp};
    let response = [200, JSON.stringify(data)];
    return response;
  }
}

module.exports = Verifier;