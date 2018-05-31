import sha256 from "sha256";
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'

import {encrypt, decrypt} from 'eth-ecies'
/* Utility function to get the sha256 hash of a file
* Returns a Promise containing the hash of the file hashed as a byte array using SHA256
* */
const getFileHash = (file, window) => {
  return new Promise(function (resolve, reject) {
    let f = file;

    if (typeof window.FileReader !== 'function') {
      reject('Browser does not support FileReader');
    }

    if (!f) {
      reject("Please select a file");
    } else {
      let fr = new window.FileReader();
      fr.onload = computeHash;
      fr.readAsArrayBuffer(f);
    }

    function computeHash(data) {
      let buffer = data.target.result;
      let bytes = new Uint8Array(buffer);
      resolve(sha256(bytes));
    }
  })
};

/*Function used to return the encrypted Byte content of a file
* Uses AES encryption with the given key
* */
const getEncryptedFileBuffer = (file, window, key)  => {
  return new Promise(function (resolve, reject) {
    let f = file;
    if (typeof window.FileReader !== 'function') {
      reject('Browser does not support FileReader');
    }
    if (!f) {
      reject("Please select a file");
    } else if (!key) {
      reject("Please select a key");
    } else {
      let fr = new window.FileReader();
      fr.onload = getBuffer;
      fr.readAsArrayBuffer(f);
    }

    function getBuffer(data) {
      let buffer = Buffer.from(data.target.result);
      let encrypted = Buffer.from(AES.encrypt(JSON.stringify(buffer), key).toString());
      resolve(encrypted)
    }

  })
};

/*Function used to return the decrypted Byte content of a file
* Uses AES encryption with the given key
* */
const getDecryptedFileBuffer = (fileBuffer, key) => {
  try {
    let bytes = AES.decrypt(fileBuffer.toString(), key);
    let decrypted = JSON.parse(bytes.toString(Utf8));
    return Buffer.from(decrypted)
  } catch (error){
    return Buffer.from("");
  }

};
/* Function encrypts given data with public Key
* */
const publicKeyEncrypt = (data, publicKey) => {
  let toEncrypt = Buffer.from(data);
  let pk = Buffer.from(publicKey, 'hex');
  return encrypt(pk, toEncrypt).toString('base64');
};

/*Function that decrypts the given data with the given privateKey*/
const privateKeyDecrypt = (data, privateKey) => {
  let pk = Buffer.from(privateKey, 'hex');
  let bufferEncryptedData = new Buffer(data, 'base64');
  let decryptedData = decrypt(pk, bufferEncryptedData);
  return decryptedData.toString('utf-8');
};

module.exports = {
  getFileHash,
  getEncryptedFileBuffer,
  getDecryptedFileBuffer,
  publicKeyEncrypt,
  privateKeyDecrypt
};

