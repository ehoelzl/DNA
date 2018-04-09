http = require('http')


server = http.createServer( function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
	//res.setHeader('Access-Control-Request-Method', '*');
	//res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  //res.setHeader('Access-Control-Allow-Headers', '*');
  	if (req.method === 'POST') {
    	console.log("POST:");
      email = ""
      hash = ""
	    req.on('data', function(data) {
	    	try{
		    	json = JSON.parse(data);
		    	email = json['email'];
		    	hash = json['hash'];
		    	console.log("email", email, "hash", hash)
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({email : email, hash : hash}));
		    }
		    catch(error){
		    	console.log('Cannot load data')
		    }
	    });

      return
    	//res.end('post received');
 	}
})

//Helper function to get ip address
function getIPAddress(local=false){
	var address, ifaces = require('os').networkInterfaces();
	for (var dev in ifaces) {
	    ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === local ? address = details.address: undefined);
	}
	return address
}

port = 4000;
host = getIPAddress(true);
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
