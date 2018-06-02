
//Default address to deploy contracts on Ropsten testnet
var mnemonic = "response exit whisper shuffle energy obey upon bean system derive educate make";
var HDWalletProvider = require('truffle-hdwallet-provider');



module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider : new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
      network_id: 3
    }
  }

};
