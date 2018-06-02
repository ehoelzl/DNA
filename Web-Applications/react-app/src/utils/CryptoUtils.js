/*Cryptographic functions*/

import sha256 from "sha256";
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import {ENCRYPTION_ERROR} from '../utils/ErrorHandler';

import {encrypt, decrypt} from 'eccrypto'
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
const getEncryptedFileBuffer = (file, window, key) => {
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
  } catch (error) {
    return Buffer.from("");
  }

};

const serializeCipher = (cipher) => {
  return Buffer.concat([
    cipher.iv, // 16 bytes
    cipher.ephemPublicKey, // 65 bytes
    cipher.mac,  // 32 bytes
    cipher.ciphertext
  ]).toString('base64')
};

const unserializeCipher = (encoded) => {
  let encrypted = Buffer.from(encoded, 'base64');
  let iv = encrypted.slice(0, 16);
  let ephemPubKey = encrypted.slice(16, 81);
  let mac = encrypted.slice(81, 113);
  let ciphertext = encrypted.slice(113);
  return {
    iv : iv,
    ephemPublicKey : ephemPubKey,
    ciphertext : ciphertext,
    mac : mac
  }
};

/* Function encrypts given data with public Key
* */
const publicKeyEncrypt = (data, publicKey) => {
  let toEncrypt = Buffer.from(data);
  let pk = Buffer.from(publicKey, 'hex');

  return new Promise((resolve, reject) => {
    encrypt(pk, toEncrypt).then(encrypted => {
      resolve(serializeCipher(encrypted))
    }).catch(e => {
      reject(ENCRYPTION_ERROR)
    })
  })
};

/*Function that decrypts the given data with the given privateKey*/
const privateKeyDecrypt = (data, privateKey) => {
  let pk = Buffer.from(privateKey, 'hex');
  let bufferEncryptedData = unserializeCipher(data);
  return new Promise((resolve, reject) => {
    decrypt(pk, bufferEncryptedData).then(decrypted => {
      resolve(decrypted.toString())
    }).catch(e => {
      reject(ENCRYPTION_ERROR)
    })
  });

};

module.exports = {
  getFileHash,
  getEncryptedFileBuffer,
  getDecryptedFileBuffer,
  publicKeyEncrypt,
  privateKeyDecrypt
};

