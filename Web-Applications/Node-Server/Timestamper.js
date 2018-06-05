const Merkle = require('merkle');
const crypto = require('crypto');
const mailer = require('./Mail-server');
const constants = require('./utils');
const utils = constants.utils;

const contract = require('truffle-contract');
const TimeStamping_abi = require('../react-app/build/contracts/TimeStamping.json');
const timeStamping = contract(TimeStamping_abi);

const N_HASHES = 4;
const MAX_TIME = 0.1; // in minutes

/**
 * Accumulate the stamps, create the merkle tree and send the signatures to the users and the root to the contract
 * */
class Timestamper {

    /**
     *
     * @param provider_
     */
    constructor(provider_) {
        timeStamping.setProvider(provider_);
        timeStamping.deployed().then(instance => {
            this.contractInstance = instance
        });
        this.address = provider_.address;
        this.resetState();
    }

    /**
     * Reset when we have accumulated enough hashes or when the first stamp has been submitted a long time ago
     * (i.e. timer > 60000*MAX_TIME)
     * */
    reset() {
        if (this.hashList.length > 0){
            let tree = this.constructTree();
            this.contractStamp(tree.root()).then(tx => { // TODO: Modified this so that we are sure the root is stored before sending the mails
                this.sendSignatures(tree);
                console.log('Successful timestamping ' + tx.tx);
                this.resetState();
            }).catch(e => console.log('Error while timestamping ' + e))
        }
    }

    /**
     * Reset the state of the timestamper
     */
    resetState() {
        this.hashList = [];
        this.hashToMail = new Map();
        this.timer = null;
    }

    /**
     *
     * @param root: The root of the Merkle tree to be sent to the smart contract
     * @returns {*}: A promise that will resolve to the stamp corresponding to the root
     *
     * Sends the root of the Merkle tree to the contract and returns a promise
     */
    contractStamp(root) {
        return this.contractInstance.ownerStamp(root, {
            from: this.address,
            gas: 100000
        })
    }

    /**
     *
     * @param json: A JSON object containing the informations used for timestamping
     *              (i.e. hash, filename, and email address)
     * @returns {*}: The corresponding response for the server depending on the state of the stamp
     *
     * Add a new Timestamp whose informations are contained in json
     */
    addTimestamp(json) {

        let email, hash, filename, response;

        email = json['email'];
        hash = json['hash'];
        filename = json['name'];

        if (!(utils.isEmail(email) && utils.isHash(hash))) {
          throw Error(constants.CORRUPTED);
        }

        if (!this.hashList.includes(hash)) {
            this.hashList.push(hash);
            this.hashToMail.set(hash, [email, filename]);
            response = [200, 'Hash successfully submitted'];
            console.log('Hash ' + hash + ' submitted for user ' + email)
        }
        else if (this.hashToMail.get(hash)[0] === email) {
            response = [401, 'Hash already submitted'] //TODO : change status codes
        }
        else {
            response = [401, 'Hash already submitted by another user']
        }

        if (this.hashList.length === N_HASHES) {
            // Clear the timer if we accumulated enough hashes and reset
            clearTimeout(this.timer);
            this.reset()
        }
        else if (this.hashList.length === 1 && this.timer === null) {
            // Set a timer when we get the min number of hashes, to avoid people waiting too long
            this.timer = setTimeout(() => this.reset(), MAX_TIME*60000)
        }

        return response;
    }

    /**
     *
     * @returns {*} The Merkle tree constructed from the accumulated hashes
     *
     * Build and return the Merkle tree constructed from the accumulated hashes until there
     */
    constructTree(){

        let n_hashes = this.hashList.length;
        let completeTree = [];

        for (let i = 0; i < n_hashes; i++){
            let hash = this.hashList[i];
            completeTree.push(hash + this.hashToMail.get(hash)[0]);
        }
        for (let i = n_hashes; i < N_HASHES; i++) {
            completeTree.push(crypto.randomBytes(32).toString('hex'));
        }
        let merkleTree = Merkle('sha256', false).sync(completeTree);
        console.log("Merkle Tree created with root:", merkleTree.root());

        return merkleTree
    }

    /**
     *
     * @param merkleTree: The Merkle tree constructed from the accumulated hashes from which we obtain the signatures
     *
     * Generates and sends signatures to the corresponding users
     */
    sendSignatures(merkleTree) {
        for (let i = 0; i < this.hashList.length; i++) {
            let h = this.hashList[i];
            mailer.sendStamp(this.hashToMail.get(h)[1], h, merkleTree.getProofPath(i, true), this.hashToMail.get(h)[0]);
            console.log('Send signature to ', this.hashToMail.get(h)[0])
        }
    }
}

module.exports = Timestamper;