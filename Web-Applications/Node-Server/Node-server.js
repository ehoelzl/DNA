const http = require('http');
const Timestamper = require('./Timestamper');
const Verifier = require('./Verifier');


/*-------------------------------Imports for interaction with Smart Contract-------------------------------*/

const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');
const TimeStamping_abi = require('./build/contracts/TimeStamping.json');

/*-------------------------------Constants for storage and Blockchain interaction-------------------------------*/

const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make"; //TODO : encrypt this
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
const timeStamping = contract(TimeStamping_abi);


const N_HASHES = 4;
const MAX_TIME = 0.1; // in minutes

const VERIFY = 'verify';
const TIMESTAMP = 'timestamp';

const hash_regex= /\b[A-Fa-f0-9]{64}\b/;
const email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
timeStamping.setProvider(provider);
let timestamper, verifier;

timeStamping.deployed().then(x => {
  timestamper = new Timestamper(x, provider.address, N_HASHES, MAX_TIME);
  verifier = new Verifier(x);
  console.log('Contract Loaded at '+ x.address)
}).catch(e => console.log(e));



//Helper function to get ip address
function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
}

/*Verifies that the given string matches the given regex*/
function isRegex(str, regex){
  return str.match(regex) !== null;
}

/*Verifies that the given JSON file is a json*/
function isSignature(json){
  for (let i=0; i<json.length-1; i++){
    let level = json[i];
    if (level['left'] === undefined || level['right'] === undefined) return false;
  }

  return json[json.length - 1]['email'] !== undefined
}

/* Function that takes in the data as a string and tries to parse all the information from it depending on the operation
* Verifies the correct format of the data
* Returns : the json data parsed
* Throws : An error if the data is not correct
* */
function getJson(data) {
  let json, op;
  try {
    json = JSON.parse(data);
    op = json['operation'];
    let hash = json['hash'];
    if (op === VERIFY) {
      json['signature'] = JSON.parse(json['signature']);
      if (!(isSignature(json['signature']) && isRegex(hash, hash_regex))) throw Error()
    } else if (op === TIMESTAMP) {
      let email = json['email'];
      if (!(isRegex(email, email_regex) && isRegex(hash, hash_regex))) throw Error()
    }
    return json;
  } catch (error) {
    throw Error('Data is corrupted')
  }
}

// Simple server to accumulate hashes
var server = http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST') {
    let response = [];

    req.on('data', async function (data) {
      let response;
      try {
        let json = getJson(data);
        let op = json['operation'];
        if (op === VERIFY) {
          console.log("=================== POST for verification =================== ");
          let stamp_user = verifier.getTimestamp(json);
          let stamp = await stamp_user[0];
          let email = stamp_user[1];
          response = Verifier.getResponse(stamp.toNumber(), email) //Response is 200 if and only if a timestamp was found, otherwise 400
        }
        else if (op === TIMESTAMP) {
          console.log("===================  POST for timestamping =================== ");
          response = timestamper.addTimestamp(json);
        } else {
          response = [400, 'Unknown Operation']
        }
      }
      catch (error) {
        response = [400, error.message]
      }
      res.writeHead(response[0], {'Content-Type': 'text/plain'});
      res.write(response[1]);
      res.end()
    });


  }
});


var port = 4000;
var host = getIPAddress(process.argv[2] === 'true');
server.listen(port, host);

console.log('Listening at http://' + host + ':' + port);

