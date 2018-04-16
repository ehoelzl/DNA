const HDWalletProvider = require('truffle-hdwallet-provider');
const contract = require('truffle-contract');

const mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");

//2.Get the abi of the contract and its instance
const TimeStamping_abi = require('../react-app/build/contracts/TimeStamping.json');
const timeStamping = contract(TimeStamping_abi);
timeStamping.setProvider(provider);
let contractInstance;
timeStamping.deployed().then(x => {
  const sha256 = require('sha256');
  contractInstance = x
  let h = sha256('a')
  console.log(h)
  contractInstance.getTimestamp.call(h).then(res => console.log(res))
  /*contractInstance.ownerStamp(h, {
    from : provider.address,
    gas : 100000
  }).then(tx => console.log(tx))*/


});





