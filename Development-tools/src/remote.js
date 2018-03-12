var chalk = require("chalk");
var solc = require("solc");
var EthTx = require("ethereumjs-tx");
var EthUtil = require("ethereumjs-util");
var fs = require("fs");
var lodash = require("lodash");
var Spinner = require("cli-spinner").Spinner;
var Q = require('q');
var utils = require('web3/lib/utils/utils');
var sha3 = require('web3/lib/utils/sha3');
var coder = require('web3/lib/solidity/coder');
var errors = require('web3/lib/web3/errors');

class Remote {

  constructor({privateKey, web3}) {
    this.privateKey = privateKey;
    this.privateKeyx = new Buffer(privateKey, 'hex');
    this.acct = "0x" + EthUtil.privateToAddress("0x" + privateKey).toString('hex');
    this.web3 = web3;
    this.last = {
      txHash: null,
      blockNumber: null,
      contractAddress: null
    }
  }

  // Temporary
  createSpinner(ident) {
    if(ident === 'mining') {
      var spinner = new Spinner(chalk.yellow("%s Waiting for transaction to be mined..."));
      spinner.setSpinnerString(0);
      return spinner;
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
      contractSource = fs.readFileSync(source, 'utf8'); }
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
    return this.web3.eth.contract(this.abi(contractSource));
  }

  /*
  * Creates an instance of a contract
  * @param source{string} Contract source code or file location
  * @param address{string} The address of the deployed contract
  * @returns {Contract} A new contract instance
  * */
  deployed(source, address) {
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source; }
    else {
      contractSource = fs.readFileSync(source, 'utf8'); }
    return this.contract(contractSource).at(address);
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
  * Sends ether from one account to another. From account that has started the program
  * @param _to{string} The address of the receiver
  * @param _value{int} The amount in ether to be transfered
  * @param options{JSON} Options to be passed to the transaction
  * @returns {string} The transaction hash once it has been mined
  *
  * */
  sendEther({to, value}, options={}) {
    var renderContext = this;
    var deferred = Q.defer();

    deferred.promise
    .then((data) => {
      console.log(chalk.green(`Transaction Confirmed: Block Number: ${chalk.underline(data.blockNumber)}, Gas Used: ${chalk.underline(data.gasUsed)}`));
      renderContext.last = {
        txHash: data.transactionHash, blockNumber: data.blockNumber, contractAddress: null }; })
    .catch((error) => {
      console.log(chalk.red("Error Sending Ether")); console.log(error); })

    var callback = (error, txHash) => {
      if(error) {
        console.log(chalk.red("Error Sending Ether")); console.log(error); }
      else {
        console.log(chalk.green(`Sending ${chalk.underline(this.web3.fromWei(value).toString())} ETH to ${chalk.underline(to)} | Transaction Hash: ${chalk.underline(txHash)}`))
        var spinner = renderContext.createSpinner('mining');
        spinner.start();
        var miningInterval = setInterval(() => {
          var txReceipt = renderContext.web3.eth.getTransactionReceipt(txHash);
          if(txReceipt) {
            deferred.resolve(txReceipt);
            spinner.stop(true);
            clearInterval(miningInterval);
          }
        }, 1000)
      }
    }

    var rawTx = {
      nonce: this.web3.toHex(this.web3.eth.getTransactionCount(this.acct)),
      from: this.acct,
      to: to,
      value: web3.toHex(value),
      gasLimit: web3.toHex(options.gas || 21000),
      gasPrice: this.web3.toHex(options.gasPrice || this.web3.eth.gasPrice)
    }

    var tx = new EthTx(rawTx);
    tx.sign(this.privateKeyx);
    var txData = tx.serialize().toString('hex');

    this.web3.eth.sendRawTransaction(`0x${txData}`, callback);
  }

  /*
  * Deploys a new contract to the blockchain (From the acct1 by default)
  * @param source{string} Contract source code or file location
  * @param params{Array} The parameters to be passed to the constructor upon creation
  * @param options{JSON} The options to pass to the transaction of contract creation (typically some gas)
  * */
  deployContract(source, params=[], options={}) {
    var renderContext = this;
    var deferred = Q.defer();

    //Get the source
    var contractSource;
    if(this.contractName(source)) {
      contractSource = source;
    } else {
      contractSource = fs.readFileSync(source, 'utf8');
    }

    //Compile and create bytecode object, and interface
    var compiled = solc.compile(contractSource);
    var contractName = this.contractName(contractSource);
    var bytecode = compiled.contracts[`:${contractName}`].bytecode;
    var abi = JSON.parse(compiled.contracts[`:${contractName}`].interface);
    var contract = this.web3.eth.contract(abi);
    var contractData = `0x${contract.new.getData(...params, {data: bytecode})}`;

    deferred.promise
    .then((data) => {
      console.log(chalk.green(`Contract Deployed: Contract Address: ${chalk.underline(data.contractAddress)}, Block Number: ${chalk.underline(data.blockNumber)}, Gas Used: ${chalk.underline(data.gasUsed)}`));
      renderContext.last = {
        txHash: data.transactionHash, blockNumber: data.blockNumber, contractAddress: data.contractAddress }; })
    .catch((error) => {
      console.log(chalk.red("Error Deploying Contract")); console.log(error); })

    var callback = (error, txHash) => {
      if(error) {
        console.log(chalk.red("Error Deploying Contract")) ; console.log(error); }
      else {
        console.log(chalk.green(`Deploying Contract ${chalk.underline(contractName)} | Transaction Hash: ${chalk.underline(txHash)}`));
        var spinner = renderContext.createSpinner('mining');
        spinner.start();
        var miningInterval = setInterval(() => {
          var txReceipt = renderContext.web3.eth.getTransactionReceipt(txHash);
          if(txReceipt) {
            deferred.resolve(txReceipt);
            spinner.stop(true);
            clearInterval(miningInterval);
          }
        }, 1000)
      }
    };

    //Create transaction to deploy contract
    var rawTx = {
      nonce: this.web3.toHex(this.web3.eth.getTransactionCount(this.acct)),
      from: this.acct,
      data: contractData,
      gasLimit: this.web3.toHex(options.gas || this.web3.eth.estimateGas({ data: contractData })),
      gasPrice: this.web3.toHex(options.gasPrice || this.web3.eth.gasPrice)
    };

    var tx = new EthTx(rawTx);
    tx.sign(this.privateKeyx);
    var txData = tx.serialize().toString('hex');

    this.web3.eth.sendRawTransaction(`0x${txData}`, callback);
  }




  /*
  * Auxiliary Function to encode the method to be called
  * @param deployed_abi{JSON} The abi of the contract to call
  * @param methodName{string} The name of the method to be called
  * @param params{Array} the parameters to pass to the method
  * @returns {hex} The encoded payload data
  * */
  encodePayloadData(deployed_abi, methodName, params=[]){
    var method_abi = lodash.find(deployed_abi, {name : methodName});
    var name = utils.transformToFullName(method_abi);
    var inputTypes = method_abi.inputs.map(i => i.type);

    console.log(inputTypes)
    console.log(params)
    if (params.length !== inputTypes.length) {
      throw errors.InvalidNumberOfSolidityArgs();
    }
    var method_signature = sha3(name).slice(0, 8);
    var data = '0x' + method_signature + coder.encodeParams(inputTypes, params);
    return data;
  }

  /*
  * Function used to call methods that are not constant (require a change of state of the EVM)
  * @param deployed{Contract} The contract instance to call
  * @param methodName{string} The name of the method to call
  * @param params{Array} The parameters to pass to the method
  * @param options{JSON} The options to pass to the transaction of contract creation (typically some gas)
  *
  * */
  callContract(deployed, methodName, params=[], options={}) {
    var renderContext = this;
    var deferred = Q.defer();

    //var solidityFunction = new SolidityFunction('', lodash.find(deployed.abi, { name: methodName }), deployed.address);
    var payloadData = this.encodePayloadData(deployed.abi, methodName, params);

    deferred.promise
    .then((data) => {
      console.log(chalk.green(`Executed Contract Call: Block Number: ${chalk.underline(data.blockNumber)}, Gas Used: ${chalk.underline(data.gasUsed)}`));
      renderContext.last = {
        txHash: data.transactionHash, blockNumber: data.blockNumber, contractAddress: deployed.address }; })
    .catch((error) => {
      console.log(chalk.red("Error Calling Contract")); console.log(error); });

    var callback = (error, txHash) => {
      if(error) {
        console.log(chalk.red("Error Calling Contract")); console.log(error); }
      else {
        console.log(chalk.green(`Calling Contract ${chalk.underline(deployed.address)} | Transaction Hash: ${chalk.underline(txHash)}`))
        var spinner = renderContext.createSpinner('mining');
        spinner.start();
        var miningInterval = setInterval(() => {
          var txReceipt = renderContext.web3.eth.getTransactionReceipt(txHash);
          if(txReceipt) {
            deferred.resolve(txReceipt);
            spinner.stop(true);
            clearInterval(miningInterval);
          }
        }, 1000)
      }
    };



    var rawTx = {
      nonce: this.web3.toHex(this.web3.eth.getTransactionCount(this.acct)),
      from: this.acct,
      data: payloadData,
      gasLimit: this.web3.toHex(options.gas || this.web3.eth.estimateGas({ data: payloadData })),
      gasPrice: this.web3.toHex(options.gasPrice || this.web3.eth.gasPrice),
      value : this.web3.toHex(options.value || 0),
      to: deployed.address
    };

    var tx = new EthTx(rawTx);
    tx.sign(this.privateKeyx);
    var txData = tx.serialize().toString('hex');

    this.web3.eth.sendRawTransaction(`0x${txData}`, callback)
  }

}

module.exports = Remote;
