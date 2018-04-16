/* TODO:
Status codes: OK
Mettre signature mail dans un fichier txt/json OK
Communiquer smart contract
modulariser / clean code OK
verification timestamp OK

// que fait on si hash deja submit ???
*/

//1. Import required files and set the provider (Ropsten address at 0x6A9aa07E06033Ac0Da85ac8a9b11fe8Ab65c253e)
const http = require('http');
const Merkle = require('merkle');
const crypto = require('crypto');
const mailer = require('./Mail-server');
const sha256 = require('sha256');


/*-------------------------------Imports for interaction with Smart Contract-------------------------------*/

const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');
const TimeStamping_abi = require('../react-app/build/contracts/TimeStamping.json');

/*-------------------------------Constants for storage and Blockchain interaction-------------------------------*/

const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make"; //TODO : encrypt this
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
const timeStamping = contract(TimeStamping_abi);
timeStamping.setProvider(provider);
let contractInstance;
timeStamping.deployed().then(x => {contractInstance = x; console.log('Contract Loaded')}).catch(e => console.log(e));
const N_HASHES = 4;
const MAX_TIME = 1;
let hashes = [];
let start = Date.now();
let hashToMail = new Map();



/*Function that resets the state of the server*/
function resetState() {
  hashes = [];
  hashToMail.clear();
  start = Date.now();
}

/*-------------------------------Functions for timestamp submission and sending the signatures to the clients-------------------------------*/

/*Function that generates and sends signatures to the corresponding user
* Returns : The root of the generated tree
* */
function sendSignatures(hashes, hashToMail) {
  let n_hashes = hashes.length;

  for (let i = hashes.length; i < N_HASHES; i++) {
    hashes.push(crypto.randomBytes(32).toString('hex'));
  }

  let merkleTree = Merkle('sha256', false).sync(hashes);
  console.log("Merkle Tree created with root:", merkleTree.root());

  for (let i = 0; i < n_hashes; i++) {
    mailer.send(hashes[i], merkleTree.getProofPath(i, true), hashToMail.get(hashes[i]));
    console.log('Send signature to ', hashToMail.get(hashes[i]))
  }
  return merkleTree.root()
}

/*Sends the root of the Merkle tree to the contract*/
function contractStamp(root) {
  contractInstance.ownerStamp(root, {
    from: provider.address,
    gas: 100000
  }).then(tx => {
    console.log('Successful ' + tx.tx);
    resetState()
  }).catch(e => console.log('Error ' + e))
}

/*Function that adds a hash to the queue from the json
* Calls the sendSignatures method when the queue is full
* Returns : The response message to send back to the client
* */
function addTimestamp(json) {
  let email;
  let hash;
  let response_data;
  try {
    email = json['email'];
    hash = json['hash'];
  }
  catch (error) {
    response_data = 'Data is corrupted'
  }

  if (!hashes.includes(hash)) {
    hashes.push(hash);
    hashToMail.set(hash, email);
    response_data = 'Hash successfully submitted';
    console.log("hash " + hash + " successfully submitted for user " + email)
  } else if (hash !== undefined && email !== undefined) {
    if (hashToMail.get(hash) === email) {
      response_data = 'Hash already submitted by user';
      console.log("hash " + hash + " has already been submitted");
    }
    else {
      response_data = 'Hash already submitted by another user';
      console.log("hash " + hash + " has already been submitted by another user");
    }
  }

  //console.log((Date.now()-start)/60000)
  if (hashes.length === N_HASHES) {
    let root = sendSignatures(hashes, hashToMail);
    contractStamp(root);
  }
  return response_data;
}


/*-------------------------------Functions for timestamp verification-------------------------------*/

/* Function that takes in a hash and returns the root of the tree generated with the given proof path
* Throws an error if the proof did not work
* */
function getRootFromProof(hash, signature) {
  if (signature.length === 0) {
    return hash;
  }

  let current = hash;
  for (let i = 0; i < signature.length; i++) {
    let left = signature[i]['left'];
    let right = signature[i]['right'];
    if (!(current === left || current === right)) {
      throw Error('Signature does not match');
    } else {
      current = sha256(left + right);
    }
  }

  return current

}



/*Function that verifies that the hash and the signature are timestamped
*
* Returns : A promise that resolves into the timestamp
* */
function verify(json) {
  let hash;
  let signature;
  let response_data;

  hash = json['hash'];
  signature = JSON.parse(json['signature']);
  console.log("verifying hash " + hash);
  let root = getRootFromProof(hash, signature);
  return contractInstance.getTimestamp.call(root);
}







//Helper function to get ip address
function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
}


function getResponse(stamp){
  let response;
  if (stamp === 0){
    response = "No timestamp found in Database"
  } else {
    let date = new Date(stamp*1000);
    response = 'Timestamped on '+date.toDateString() + ' at ' + date.toTimeString();
  }

  return response;
}

// Simple server to accumulate hashes
var server = http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST') {
    let response;
    let status_code;

    req.on('data', async function (data) {
      try {
        let json = JSON.parse(data);
        let op = json['operation'];
        if (op === 'verify') {
          console.log("=================== POST for verification =================== ");
          let stamp = (await verify(json)).toNumber();
          response = getResponse(stamp);
        }
        else if (op === 'timestamp') {
          console.log("===================  POST for timestamping =================== ");
          response = addTimestamp(json)
        } else {
          console.log('Unknown Operation');
        }
        status_code = 200;
      }
      catch (error) {
        status_code = 400;
        response = error.message
      }
      res.writeHead(status_code, {'Content-Type': 'text/plain'});//, {'Content-type': 'application/json'});
      res.write(response);
      res.end()
    });

  }
  /*if ((Date.now() - start) / 60000 >= MAX_TIME) {
    if (hashes.length > 0) {
      reset();
    }
    else {
      start = Date.now();
    }
  }*/
});

var port = 4000;
var host = getIPAddress(process.argv[2] === 'true');
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

/*var tree = computeMerkleTree([0, 1, 2, 3])
console.log(tree.root())
console.log(tree.level(2))
console.log(tree.getProofPath(0, true))
console.log(sha256('0'))*/
