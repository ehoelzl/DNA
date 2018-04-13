/* TODO: 
Status codes: OK
Mettre signature mail dans un fichier txt/json OK
Communiquer smart contract
modulariser / clean code OK
verification timestamp OK

// que fait on si hash deja submit ???
*/

//1. Import required files and set the provider (Ropsten address at 0x6A9aa07E06033Ac0Da85ac8a9b11fe8Ab65c253e)
var http = require('http');
//HDWalletProvider = require('truffle-hdwallet-provider');
// Contract = require('truffle-contract');
var Merkle = require('merkle');
var crypto = require('crypto');
var mailer = require('./Mail-server')
var Twitter = require('./Tweets-server')
var sha256 = require('sha256')


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
function timestamp(json){
    var email = "";
    var hash = "";
    try{
        email = json['email'];
        hash = json['hash'];
    }
    catch(error){
        console.log(error)
    }
    var response_data = ""
    if(!hashes.includes(hash)){
        hashes.push(hash);
        hashToMail.set(hash, email)
        console.log("hash " + hash + " succesfully submitted for user " + email)
    }
    else {
        if(hashToMail.get(hash) === email){
            console.log("hash " + hash + " has already been submitted");
        }
        else {
            console.log("hash " + hash + " has already been submitted by another user");
        }
    }
    //console.log((Date.now()-start)/60000)
    if (hashes.length === N_HASHES){
        reset();
    }
    var response_data = ""
    return response_data;
}

// verification timestamp: hash + signature (fichier)
function verify(json){
    var hash = ""
    var signature = ""
    try {
        hash = json['hash'];
        signature = JSON.parse(json['signature']);
        console.log("verifying hash " + hash + " with signature " + JSON.stringify(signature))
    }
    catch(error){
        console.log(error);
    }
    var check = true
    // first check that hash is a leaf of the tree
    if(hash != signature[0]['left'] && hash != signature[0]['right']){
        check = false
    }
    else {
        // then check that the tree is consistent
        for(var i=0; i<signature.length-1; i++){
            var h = sha256(signature[i]['left']+signature[i]['right'])
            if(h != signature[i+1]['left'] && h != signature[i+1]['right']){
                check = false
            }
        }
    }
    // and finally compute the root and ensure it exists
    if(check) {
        var expectedRoot = sha256(signature[signature.length - 1]['left'] + signature[signature.length - 1]['right'])
        console.log("expected root: " + expectedRoot)
        // send expectedRoot to smartContract and get timestamp (0 if root does not exist)
        var timeStamp = 0;//smartContract.getTimeStamp(expectedRoot);
        /*if(timeStamp === 0){
            check = false
        }*/
    }
    if(check){
        console.log("Verification successful: hash " + hash + " has been timestamped at " + new Date(timeStamp*1000))
    }
    else {
        console.log("Verification failed")
    }
    var response_data = ""
    return response_data;
}

function reset(){
    // number of effective hashes before completing with random ones
    n_hashes = hashes.length;
    // if we didn't get enough hashes, just complete with random ones
	for(var i=hashes.length; i<N_HASHES; i++){
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
	for(var i=0; i<n_hashes; i++){
		mailer.send(hashes[i], merkleTree.getProofPath(i, true), hashToMail.get(hashes[i]))
		console.log('Send signature to ', hashToMail.get(hashes[i]))
	}
    // clean
    hashes = []
    hashToMail.clear()
    // reset timer
    start = Date.now();
}

function computeMerkleTree(hashes){
  	return Merkle('sha256', false).sync(hashes);
}

//Helper function to get ip address
function getIPAddress(local=false){
	var address, ifaces = require('os').networkInterfaces();
	for (var dev in ifaces) {
	    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address: undefined);
	}
	return address
}


// =====================================================================================================================
// Array that accumulates hashes
var hashes = [];
// time at which we began to accumulate hashes
var start = Date.now();
// number of hashes to accumulate before creating the merkle tree
const N_HASHES = 4;
// maximum time to wait before creating the merkle tree (in minutes)
const MAX_TIME = 1;
// maps hashes to mail of corresponding user
var hashToMail = new Map();

// Simple server to accumulate hashes
var server = http.createServer( function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if(req.method === 'POST') {
        var rep = ''
        req.on('data', function (data) {
            try {
                var json = JSON.parse(data);
                var op = json['operation']
                if (op === 'verify') {
                    console.log("=================== POST for verification =================== ");
                    rep = verify(json)
                }
                else if (op === 'timestamp') {
                    console.log("===================  POST for timestamping =================== ");
                    rep = timestamp(json)
                }
            }
            catch (error) {
                console.log(error);
            }
        });
        req.on('end', function(){
            res.writeHead(200, {'Content-type' : 'application/json'});
            res.end(rep);
        })
    }
    if((Date.now()-start)/60000 >= MAX_TIME){
    	if(hashes.length > 0){
    		reset();
    	}
    	else {
    		start = Date.now();
	 	}
  	}
});

var port = 4000;
var host = getIPAddress(false);
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

/*var tree = computeMerkleTree([0, 1, 2, 3])
console.log(tree.root())
console.log(tree.level(2))
console.log(tree.getProofPath(0, true))
console.log(sha256('0'))*/