const http = require('http');
const Timestamper = require('./Timestamper');
const Verifier = require('./Verifier');
const Patenter = require('./Patenting');
const formidable = require('formidable');

/*-------------------------------Imports for interaction with Smart Contracts-------------------------------*/

const HDWalletProvider = require('truffle-hdwallet-provider');


/*-------------------------------Constants for storage and Blockchain interaction-------------------------------*/

const ropsten_mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make"; //TODO : encrypt this
const rpc_mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';

const ropsten_node = "https://ropsten.infura.io/";
const local_rpc = "http://127.0.0.1:7545";

const provider = new HDWalletProvider(process.argv[2] === 'true' ? rpc_mnemonic: ropsten_mnemonic, process.argv[2] === 'true' ? local_rpc : ropsten_node );

const VERIFY = '/verify';
const TIMESTAMP = '/timestamp';

function getIPAddress(local = false) {
  let address, ifaces = require('os').networkInterfaces();
  for (let dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address : undefined);
  }
  return address
}

let timestamper = new Timestamper(provider);
let verifier = new Verifier(provider);



//Patenter(provider);
//patenter.watch();
const contract = require('truffle-contract')
const Patenting_abi = require('./build/contracts/Patenting.json');
const patenting = contract(Patenting_abi);
const mailer = require('./Mail-server')
patenting.setProvider(provider);
let event;
patenting.deployed().then(instance => {
  event = instance.NewRental();
  event.watch(function (err, res) {
    if (err)
      console.log(err);
    else {
      let rent = res.args;
      mailer.sendRental(rent._ownerMail, rent._patentName, rent._rentee);
    }
  });
  console.log('Patenting at ' + instance.address)
})



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
console.log('Listening at http://' + host + ':' + port);

