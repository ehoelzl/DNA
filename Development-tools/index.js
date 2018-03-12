#!/usr/bin/env node
var prompt = require('prompt');
var program = require("commander");
var chalk = require("chalk");

// Command Line Flags
program
  .option('-m, --mode <mode>', "The mode to start decypher in [local, remote, testrpc, ropsten]")
  .option('-e, --endpoint <endpoint>', "The endpoint for your node to connect to http://...")
  .option('-i, --infuraKey <infuraKey>', "The slug for your Infura instance")
  .parse(process.argv);

//Import required Libraries
global.solc = require('solc');
global.EthTx = require('ethereumjs-tx');
global.EthUtil = require('ethereumjs-util');
global.fs = require("fs");
global.Web3 = require("web3");
//global.SolidityFunction = require("web3/lib/web3/function");


//Different Modes
switch(program.mode) {

  //Testrpc is local mode with endpoint http://localhost:8545
  case "testrpc":
    program.endpoint = "http://localhost:8545";
    program.mode = "local";

  case "local":
    console.log(chalk.bold.cyan("Starting Decypher..."));

    global.web3 = new Web3(new Web3.providers.HttpProvider(`${program.endpoint}`));


    global.acct1 = web3.eth.accounts[0];
    global.acct2 = web3.eth.accounts[1];
    global.acct3 = web3.eth.accounts[2];
    global.acct4 = web3.eth.accounts[3];
    global.acct5 = web3.eth.accounts[4];
    
    var Tools = require("./src/local");
    global.tools = new Tools({ web3: global.web3});
    require('repl').start({});

    break;

  case "ropsten":

    program.endpoint = `https://ropsten.infura.io/${program.infuraKey}`;
    program.mode = "remote";


  //Remote is for remote hosts (typically ropsten or mainnet)
  case "remote":
    prompt.start();
    prompt.get([{name: 'privateKey', hidden: true}], (error, result) =>  {
      console.log(chalk.bold.cyan("Starting Decypher..."));

      global.web3 = new Web3(new Web3.providers.HttpProvider(`${program.endpoint}`));

      var Tools = require("./src/remote");
      global.tools = new Tools({ privateKey: result.privateKey, web3: global.web3 });

      require('repl').start({});
    });
    break;

  default:
    console.log(chalk.red(`Unknown Mode: '${program.mode}' - Valid modes are [local, remote, testrpc, ropsten]`));
    break;
}
