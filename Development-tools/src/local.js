var chalk = require("chalk");
var solc = require("solc");
var fs = require("fs");


class Local {

  constructor({web3}) {
    this.web3 = web3;
    this.last = {
      txHash: null,
      blockNumber: null,
      contractAddress: null
    }

  }

  /*
  * Extracts contract name from source
  *
  * @param {string} Contract source
  * @returns {string} Contract name
  * */
  contractName(source) {
    try {
      var re1 = /contract.*{/g
      var re2 = /\s\w+\s/
      return source.match(re1).pop().match(re2)[0].trim()
    }
    catch (error) {
      return false;
    }
  }

  /*
  * Extracts contract opcode from source
  * @param {string} Contract source code or file location
  * @returns {string} The opcodes
  * */
  opcodes(source) {
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source; }
    else {
      contractSource = fs.readFileSync(source, 'utf8'); }
    var compiled = solc.compile(contractSource);
    var contractName = this.contractName(contractSource);
    return compiled.contracts[`:${contractName}`].opcodes;
  }

  /*
  * Extracts contract abi
  * @param {string} Contract source code or file location
  * @returns {JSON} The contract abi
  * */
  abi(source) {
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source; }
    else {
      contractSource = fs.readFileSync(source, 'utf8');
    }
    var compiled = solc.compile(contractSource);
    var contractName = this.contractName(contractSource);
    return JSON.parse(compiled.contracts[`:${contractName}`].interface);
  }


  /*
  * Creates contract from contract source
  * @param {string} Contract source code or file location
  * @returns {Contract} Contract created from source code
  * */
  contract(source) {
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source; }
    else {
      contractSource = fs.readFileSync(source, 'utf8'); }
    return this.web3.eth.Contract(this.abi(contractSource));
  }


  /*
  * Creates an instance of a contract
  * @param source{string} Contract source code or file location
  * @param address{string} The address of the deployed contract
  * @returns {Contract} A new contract instance
  * */
  deployed(source, address) {
    return contract(source).at(address);
  }

  /*
  * Returns the balance in ether of the given address
  * @param {Contract, address} Contract or address
  * @returns {int} The ether balance of the given contract or address
  * */
  etherBalance(contract) {
    switch(typeof(contract)) {
      case "object":
        if(contract.address) {
          return this.web3.fromWei(this.web3.eth.getBalance(contract.address), 'ether').toNumber();
        } else {
          return new Error("cannot call getEtherBalance on an object that does not have a property 'address'");
        }
        break;
      case "string":
        return this.web3.fromWei(this.web3.eth.getBalance(contract), 'ether').toNumber();
        break;
    }
  }


  /*
  * Sends ether from one account to another. From account must be in wallet
  * @param _from{string} The address of the sender
  * @param _to{string} The address of the receiver
  * @param ether_val{int} The amount in ether to be transfered
  * @returns {string} The transaction hash once it has been mined
  *
  * */
  sendEther(_from, _to, ether_val){
    return this.web3.eth.sendTransaction({from : _from, to : _to, value : this.web3.toWei(ether_val, 'ether')});
  }

  /*
  * Deploys a new contract to the blockchain (From the acct1 by default)
  * @param source{string} Contract source code or file location
  * @param params{Array} The parameters to be passed to the constructor upon creation
  * @param options{JSON} The options to pass to the transaction of contract creation (typically some gas)
  * @returns {Contract} A new contract instance
  * */
  deployContract(source, params=[], options={}) {
    var renderContext = this;
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source; }
    else {
      contractSource = fs.readFileSync(source, 'utf8'); }

    var compiled = solc.compile(contractSource);
    var contractName = this.contractName(contractSource);
    var bytecode = compiled.contracts[`:${contractName}`].bytecode;
    var abi = JSON.parse(compiled.contracts[`:${contractName}`].interface);
    var contract = this.web3.eth.contract(abi);
    var loggingSentinel = false;

    var callback = (error, result) => {
      if(error) {
        console.log(chalk.red("Error Creating Contract"));
        console.log(error);
      } else {
        if(!loggingSentinel) {
          loggingSentinel = true;
        } else {
          console.log(chalk.green(`Deploying Contract ${chalk.underline(contractName)} | Transaction Hash: ${chalk.underline(result.transactionHash)}`))
          console.log(chalk.green(`Contract Address: ${chalk.underline(result.address)}`))
          renderContext.last = {
            txHash: result.transactionHash, blockNumber: result.blockNumber, contractAddress: result.address }
        }
      }
    };

    var tx = {
      from: this.web3.eth.accounts[0],
      data: bytecode,
      gas: this.web3.eth.estimateGas({ data: bytecode }),
      gasPrice: this.web3.eth.gasPrice
    };

    return contract.new(...params, Object.assign(tx, options), callback);
  }
}

module.exports = Local;
