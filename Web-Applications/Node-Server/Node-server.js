
//1. Import required files and set the provider (Ropsten address at 0x6A9aa07E06033Ac0Da85ac8a9b11fe8Ab65c253e)
Http = require('http');
HDWalletProvider = require('truffle-hdwallet-provider');
Contract = require('truffle-contract');
Merkle = require('merkle');
const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");

//2.Get the abi of the contract and its instance
TimeStamping = require('./build/contracts/TimeStamping.json');
const timeStamping = Contract(TimeStamping);
timeStamping.setProvider(provider);
var contractInstance;
timeStamping.deployed().then(x => contractInstance = x);

//3. Array that accumulates hashes
var hashes = [];


//Simple server to accumulate hashes
server = Http.createServer( function(req, res) {
  if (req.method == 'POST') {
    console.log("POST");
    body = [];
    req.on('data', (chunk) => body.push(chunk)).on('end', ()  => {
      hashes.push(Buffer.concat(body).toString());
      if (hashes.length == 5){
        computeMerkleTree(hashes);
        hashes = []
      }
    });
    res.writeHead(200);
    res.end('post received');
  }


});

function computeMerkleTree(hashes){
  var tree = Merkle('sha1').sync(hashes);
  console.log(tree)
}

//Helper function to get ip address
function getIPAddress(local=true){
  var address, ifaces = require('os').networkInterfaces();
  for (var dev in ifaces) {
    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address: undefined);
  }
  return address
}


port = 4000;
host = getIPAddress();
//server.listen(port, host);
hashes = [1,2,3,4,5,6,7,8];
var x = Merkle('sha1').sync(hashes);
var y = Merkle('sha1').sync([1]);
console.log(x.root());
console.log('Listening at http://' + host + ':' + port);