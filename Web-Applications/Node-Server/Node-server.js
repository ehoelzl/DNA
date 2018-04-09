//1. Import required files and set the provider (Ropsten address at 0x6A9aa07E06033Ac0Da85ac8a9b11fe8Ab65c253e)
http = require('http');
//HDWalletProvider = require('truffle-hdwallet-provider');
// Contract = require('truffle-contract');
Merkle = require('merkle');
crypto = require('crypto');
Twitter = require('twitter');
nodemailer = require('nodemailer');

//const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make";
//const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");

//2.Get the abi of the contract and its instance
/*TimeStamping = require('./build/contracts/TimeStamping.json');
const timeStamping = Contract(TimeStamping);
timeStamping.setProvider(provider);
var contractInstance;
timeStamping.deployed().then(x => contractInstance = x);*/

var client = new Twitter({
  consumer_key: 'iy77PEbTevF4Bpg9ibbWuEGzR',
  consumer_secret: 'r1sGVhZN8HnIYHSMtXDSRBBTXzdCl0clZis2JXCluXYdejsrlv',
  access_token_key: '978262011166511104-F7QUJqq30bqmajWTW144yK30uxWFrAZ',
  access_token_secret: 'I4GTTYBFFRBqID1DOyGRuVXojsESdYI1q3SZ4GOuMsumC'
});
 
var params = {screen_name: 'nodejs'};

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'DNA@gmail.com',
    pass: 'password'
  }
});

// Array that accumulates hashes
var hashes = [];
// time at which we began to accumulate hashes
start = Date.now();
// number of hashes to accumulate before creating the merkle tree
const N_HASHES = 2; 
// maximum time to wait before creating the merkle tree (in minutes)
const MAX_TIME = 1; 

var hashToMail = new Map();

//Simple server to accumulate hashes
server = http.createServer( function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
  	if (req.method === 'POST') {
    	console.log("POST:");
	    req.on('data', function(data) {
	    	try{
		    	json = JSON.parse(data);
		    	email = json['email'];
		    	hash = json['hash'];
		    	console.log("email", email, "hash", hash)
		    }
		    catch(error){
		    	console.log(error)
		    }
	    });
    	req.on('end', () => {
	      	hashes.push(hash); 
	      	statusCode = 400
	      	response_data = {}
	      	if(!hashToMail.has(hash)){
				hashToMail.set(hash, email)
				response_data = {email : email, hash : hash}
				statusCode = 200
	      	}
			//console.log((Date.now()-start)/60000)
			if (hashes.length === N_HASHES){
				reset();
			}
	    	res.writeHead(statusCode, {'Content-type' : 'application/json'});
	    	res.end(JSON.stringify(response_data));
    	});
 	}
    /*if((Date.now()-start)/60000 >= MAX_TIME){
    	if(hashes.length > 0){
    		reset();
    	}
    	else {
    		start = Date.now();
	 	}
  	}*/
});

function reset(){
	// if we didn't get enough hashes, just complete with random ones 
	n_hashes = hashes.length;
	for(var i=hashes.length; i<N_HASHES; i++){
		// SHA 256 => 32 bytes: 
		hashes.push(crypto.randomBytes(32).toString('hex'));
	}
	merkleTree = Merkle('sha256', false).sync(hashes);
	console.log(hashes)
	console.log("Merkle Tree created with root:", merkleTree.root())
    // 5. publish root on Twitter
    // publishRootOnTwitter(merkleTree.root())
	
	// 6. Send root to smart Contract (to be done when smart contract is done)
	
	// 7. Send signatures to corresponding users
	for(var i=0; i<n_hashes; i++){
		//send(merkleTree.getProothPath(i, true), hashToMail(hashes[i]))
		console.log('send mail to ', hashToMail.get(hashes[i]), merkleTree.getProofPath(i, true))
	}
	hashes = []
	// clean la map et toutes les listes
	
    // start = Date.now();
}

function publishRootOnTwitter(root){
	client.post('statuses/update', {status: root},  function(error, tweet, response) {
		if(error){
	  		console.log(error);
		} 
		else {
			console.log("Tweet published, root:", tweet.text);
			//console.log(tweet);  // Tweet body. 
			//console.log(response);  // Raw response object. 
		}
	});
}

function send(signature, user){
	var mailOptions = {
		from: 'DNA@gmail.com',
		to: user,
		subject: 'Signature',
		text: signature
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
    		console.log(error);
		} 
		else {
    		console.log('Email sent: ' + info.response);
  		}
	});
}

function computeMerkleTree(hashes){
  	return Merkle('sha256').sync(hashes, false);
}

//Helper function to get ip address
function getIPAddress(local=false){
	var address, ifaces = require('os').networkInterfaces();
	for (var dev in ifaces) {
	    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address: undefined);
	}
	return address
}

port = 4000;
host = getIPAddress(false);
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

