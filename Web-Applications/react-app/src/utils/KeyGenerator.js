import {getPublic} from 'eccrypto'
import {KEY_GENERATION_ERROR} from './ErrorHandler'

/*Generates a cryptographic key to encrypt the files on IPFS
*
* Key = Elliptic Curve Digital Signature Algo(sha3(sha256(file)) => depends on user + file and is not reproducible by anyone else
* */
const generatePrivateKey = function (web3, fileHash) {
  let toSign = web3.sha3(fileHash); // Hash the address
  return new Promise((resolve, reject) => {
    web3.eth.sign(web3.eth.coinbase, toSign, (err, res) => {
      if (!err) {
        resolve(res.substr(2, 64));
      } else {
        reject(KEY_GENERATION_ERROR)
      }
    })
  })
};

/*Returns the public key associated to a given private key*/
const generatePublicKey = function (privateKey) {
  if (privateKey !== null) {
    return getPublic(Buffer.from(privateKey, 'hex')).toString('hex')//EthUtil.privateToPublic(Buffer.from(privateKey, 'hex')).toString('hex');
  } else {
    return null
  }
};


module.exports = {
  generatePrivateKey,
  generatePublicKey
};