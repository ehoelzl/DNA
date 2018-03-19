# Ethereum Decentralized App development Tools


These development tools for creating, compiling and deploying contract to the Ethereum blockchain (local or remote nodes). Code was taken from decyphertv : https://github.com/AlwaysBCoding/decyphertv and adapted for newer versions of used libraries.


## Main Libraries  Used
* [Ethereumjs-tx] - Javascript library for ethereum transactions version 1.3.4
* [Ethereumjs-util] - Utility functions version 5.1.5
* [Solc] - Solidity compiler version 0.4.21
* [Web3] - Javascript library to interact with the blockchain version 0.20.5

## Installation

The development tools require some dependencies for them to work.

Install the dependencies and devDependencies and start the server.

```sh
$ apt-get install git
$ apt-get install npm
$ npm install -g ethereumjs-testrpc
$ cd /Development-tools
```
#### Running the application 
After installing all dependencies, cd into the application folder and run the following commands

```sh
$ npm install
$ node index.js -m <mode> -e <endpoint> -i <privateKey>
```

| Mode | Endpoint | privateKey | Other |
| ------ | ------ | ------ | ------ |
| testrpc | default=http://localhost:8545 | none |
| ropsten | no need to specify | ropsten account address | privateKey of account
| local | address of local node | none |
| remote | address of remote node | address of corresponding network |

#### Docker
A Dockerfile is also available and creates an environment to run the app.
It will build the docker image exposing port 8545 for testrpc (might take time depending on internet connection speed) 
```sh
$ docker build -t <name> .
```
To launch a container in background with a testrpc instance 
```sh
$ docker run -d <name> testrpc
```
Check for the testrpc container's IP address (in "NetworkSettings")
```sh
$ docker inspect <container_name>
```
To use the tools run the following command to open another container and install all dependencies
```sh
$ docker run -ti <name>
$ root@docker-container # cd /dna_development
$ root@docker-container # node index.js -m <mode> -e <endpoint> -i <privateKey> 
```

To connect to the docker container running testrpc (usually on 172.17.0.2:8545 but can change if you have running containers)
 ``` sh
 $ root@docker-container # node index.js -m local -e http://<testrpc_ip>:8545
 ```

# Development

#### Local node
To be completed
#### Remote node 
To be completed

   
   [Ethereumjs-tx]: <https://github.com/ethereumjs/ethereumjs-tx>
   [Ethereumjs-util]: <https://github.com/ethereumjs/ethereumjs-util>
   [Solc]: <https://github.com/ethereum/solc-js>
   [Web3]: <https://github.com/ethereum/web3.js/>
