const http = require('http');
const formidable = require('formidable');
const Timestamper = require('./Timestamper');
const Verifier = require('./Verifier');
const Patenter = require('./Patenting');

/*-------------------------------Imports for interaction with Smart Contracts-------------------------------*/

const HDWalletProvider = require('truffle-hdwallet-provider');


/*-------------------------------Constants for storage and Blockchain interaction-------------------------------*/

const ropsten_mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make"; //TODO : encrypt this
const rpc_mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

const ropsten_node = "https://ropsten.infura.io/";
const local_rpc = "http://127.0.0.1:7545";

const provider = new HDWalletProvider(process.argv[2] === 'true' ? rpc_mnemonic: ropsten_mnemonic, process.argv[2] === 'true' ? local_rpc : ropsten_node );

let timestamper = new Timestamper(provider);
let verifier = new Verifier(provider);
let patenter = new Patenter(provider)

const VERIFY = '/verify';
const TIMESTAMP = '/timestamp';

function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
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
        } else {
          response = [404, "Operation not permitted"]
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
patenter.listen()
console.log('Listening at http://' + host + ':' + port);
