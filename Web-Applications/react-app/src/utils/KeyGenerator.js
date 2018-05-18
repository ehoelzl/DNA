import EthUtil from 'ethereumjs-util'


/*Generates a cryptographic key to encrypt the files on IPFS
*
* Key = Elliptic Curve Digital Signature Algo(hash(file)) => depends on user + file and is not reproducable by anyone else
* */
const generateKey = function (web3, fileHash) {
  let toSign = web3.sha3(fileHash); // Hash the address
  return new Promise((resolve, reject) => {
    web3.eth.sign(web3.eth.coinbase, toSign, (err, res) => {
      if (!err) {
        resolve(res.substr(2, 64));
      } else {
        reject("Could not generate a key")
      }
    })
  })
};

const generateAddressFromKey = function (key) {
  if (key !== null) {
    let address = EthUtil.privateToAddress(this.key).toString('hex');
    console.log(key, address);
  }
};


module.exports = {
  generateKey
};