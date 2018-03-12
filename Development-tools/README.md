
----------This is an explanation on how to use the command line development tools taken and adjusted form https://github.com/AlwaysBCoding/decyphertv----------

Disclaimer : These tools have been adjusted to newer versions of libraries it uses. It's use is for basic interactions with the blockchain via web3 and a node console. For this you will need to have npm and 			nodejs and testrpc installed on your machine. In later versions we can maybe dockerize a development environment for testing purposes.

1. The file package.json defines all the libraries that will be used by these tools. Run "npm install" to install all libraries. A folder node_modules will be created and is ignored by git. The libraries are :
	-"chalk": "^2.3.2",
    	-"cli-spinner": "^0.2.8",
    	-"commander": "^2.15.0",
    	-"ethereumjs-tx": "^1.3.4",
    	-"ethereumjs-util": "^5.1.5",
    	-"fs": "0.0.1-security",
    	-"lodash": "^4.17.5",
    	-"prompt": "^1.0.0",
    	-"q": "^1.5.1",
    	-"solc": "^0.4.21",
    	-"web3": "^1.0.0-beta.30".


2.
