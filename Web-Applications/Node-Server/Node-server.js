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
//HDWalletProvider = require('truffle-hdwallet-provider');
// Contract = require('truffle-contract');
const Merkle = require('merkle');
const crypto = require('crypto');
const mailer = require('./Mail-server');
const sha256 = require('sha256');


//const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make";
//const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");

//2.Get the abi of the contract and its instance
/*TimeStamping = require('./build/contracts/TimeStamping.json');
const timeStamping = Contract(TimeStamping);
timeStamping.setProvider(provider);
var contractInstance;
timeStamping.deployed().then(x => contractInstance = x);*/

// var params = {screen_name: 'nodejs'};


// =====================================================================================================================
function timestamp(json) {
  let email;
  let hash;
  let response_data;
  try {
    email = json['email'];
    hash = json['hash'];
  }
  catch (error) {
    console.log(error);
  }


  if (!hashes.includes(hash)) {
    hashes.push(hash);
    hashToMail.set(hash, email);
    response_data = 'Hash successfully submitted';
    console.log("hash " + hash + " succesfully submitted for user " + email)
  }
  else {
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
    reset();
  }
  return response_data;
}

/*
* Function that takes in a hash and returns the root of the tree generated with the given proof path
*
* Throws an error if the proof did not work
* */
function getRoot(hash, signature) {

  if (signature.length === 0) {
    return hash;
  }

  let current = hash;
  for (let i = 0; i < signature.length; i++) {
    let left = signature[i]['left'];
    let right = signature[i]['right'];
    if (!(current === left || current === right)) {
      console.log(signature[i], current);
      throw Error('Signature does not match');
    } else {
      current = sha256(left+right);
    }
  }

  return current

}

// verification timestamp: hash + signature (fichier)
function verify(json) {
  let hash;
  let signature;
  let response_data;

  try {
    hash = json['hash'];
    signature = JSON.parse(json['signature']);
    console.log("verifying hash " + hash + " with signature " + JSON.stringify(signature));
    let root = getRoot(hash, signature);

    response_data = 'Found root ' + root;
    //Check if the root is in the smart contract using truffle

    //if ROOT in smart contract, it will return the timestamp
    /*if (check) {
      console.log("Verification successful: hash " + hash + " has been timestamped at " + new Date(timeStamp * 1000))
    }
    else {
      console.log("Verification failed")
    }*/
  }
  catch (error) {
    //Error handling here (assign error message to response data)
    console.log(error);
  }


  return response_data;
}

function reset() {
  // number of effective hashes before completing with random ones
  n_hashes = hashes.length;
  // if we didn't get enough hashes, just complete with random ones
  for (let i = hashes.length; i < N_HASHES; i++) {
    // SHA 256 => 32 bytes:
    hashes.push(crypto.randomBytes(32).toString('hex'));
  }
  const merkleTree = computeMerkleTree(hashes);
  console.log(hashes)
  console.log("Merkle Tree created with root:", merkleTree.root())
  // 5. publish root on Twitter
  // Twitter.tweet(merkleTree.root())

  // 6. Send root to smart Contract (to be done when smart contract is done)

  // 7. Send signatures to corresponding users
  for (var i = 0; i < n_hashes; i++) {
    mailer.send(hashes[i], merkleTree.getProofPath(i, true), hashToMail.get(hashes[i]))
    console.log('Send signature to ', hashToMail.get(hashes[i]))
  }
  // clean
  hashes = []
  hashToMail.clear()
  // reset timer
  start = Date.now();
}

function computeMerkleTree(hashes) {
  return Merkle('sha256', false).sync(hashes);
}

//Helper function to get ip address
function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
}


// =====================================================================================================================
// Array that accumulates hashes
let hashes = [];
// time at which we began to accumulate hashes
let start = Date.now();
// number of hashes to accumulate before creating the merkle tree
const N_HASHES = 4;
// maximum time to wait before creating the merkle tree (in minutes)
const MAX_TIME = 1;
// maps hashes to mail of corresponding user
let hashToMail = new Map();

// Simple server to accumulate hashes
var server = http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST') {
    let response;
    req.on('data', function (data) {
      try {
        let json = JSON.parse(data);
        let op = json['operation'];
        if (op === 'verify') {
          console.log("=================== POST for verification =================== ");
          response = verify(json)
        }
        else if (op === 'timestamp') {
          console.log("===================  POST for timestamping =================== ");
          response = timestamp(json)
        } else {
          console.log('Unkown Operation');
        }
      }
      catch (error) {
        console.log(error);
      }
    });
    req.on('end', function () {
      res.writeHead(200, {'Content-type': 'application/json'});
      res.end(response);
    })
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
var host = getIPAddress(true);
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

/*var tree = computeMerkleTree([0, 1, 2, 3])
console.log(tree.root())
console.log(tree.level(2))
console.log(tree.getProofPath(0, true))
console.log(sha256('0'))*/
