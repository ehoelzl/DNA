const http = require('http');
const Timestamper = require('./Timestamper');
const Verifier = require('./Verifier');
const Patenting = require('./Patenting');

const formidable = require('formidable');

/*-------------------------------Imports for interaction with Smart Contract-------------------------------*/

const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');
const TimeStamping_abi = require('./build/contracts/TimeStamping.json');

/*-------------------------------Constants for storage and Blockchain interaction-------------------------------*/

const ropsten_mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make"; //TODO : encrypt this
const rpc_mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

const ropsten_node = "https://ropsten.infura.io/";
const local_rpc = "http://127.0.0.1:7545";

const provider = new HDWalletProvider(process.argv[2] === 'true' ? rpc_mnemonic: ropsten_mnemonic, process.argv[2] === 'true' ? local_rpc : ropsten_node );
const timeStamping = contract(TimeStamping_abi);


const N_HASHES = 4;
const MAX_TIME = 3; // in minutes

const VERIFY = '/verify';
const TIMESTAMP = '/timestamp';
const DEPOSIT = '/deposit';





timeStamping.setProvider(provider);
let timestamper, verifier, patenter;

timeStamping.deployed().then(x => {
  timestamper = new Timestamper(x, provider.address, N_HASHES, MAX_TIME);
  verifier = new Verifier(x);
  patenter = new Patenting('');
  console.log('Timestamping contract Loaded at '+ x.address)
}).catch(e => console.log(e));




function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
}

function manageRequests(operation, fields, files){

}
// Simple server to accumulate hashes
var server = http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    let response = [];
    let op = req.url;

    let form = new formidable.IncomingForm(); //New way of parsing, easier to read

    form.parse(req, async function (err, fields, files) {
      try {
        if (op === TIMESTAMP){
          console.log("=================== POST for timestamping =================== ");
          response = timestamper.addTimestamp(fields);
        } else if (op === VERIFY){
          console.log("===================  POST for verification =================== ");
          let stamp_user = verifier.getTimestamp(fields);
          let stamp = await stamp_user[0];
          let email = stamp_user[1];
          response = Verifier.getResponse(stamp.toNumber(), email)
        } else if (op === DEPOSIT){
          console.log("===================  POST for Patenting =================== ");
          let ipfs_location = await patenter.addFile(files['file']);
          console.log(ipfs_location);
          response = [200, ipfs_location[0].path];
        } else {

        }
      } catch (error) {
        response = [400, error.message]
      }
      res.writeHead(response[0], {'Content-Type': 'text/plain'});
      res.write(response[1]);
      res.end()
    })

  }
});


var port = 4000;
var host = getIPAddress(process.argv[2] === 'true');
server.listen(port, host);

console.log('Listening at http://' + host + ':' + port);

