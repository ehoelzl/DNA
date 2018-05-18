import sha256 from "sha256";
import AES from 'crypto-js/aes'
/*
* Utility function to get the sha256 hash of a file
*
* Returns a Promise containing the hash of the file hashed as a byte array using SHA256
* */
const getFileHash = function (file, window) {
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
const getEncryptedFileBuffer = function (file, window, key) {
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

/*Utility function that extracts the json from a file and returns a promise that resolves into the json object,
* or is rejected if the parsing could not occur*/
const extractJson = function (file, window) {
  return new Promise(function (resolve, reject) {
    let f = file;
    if (typeof window.FileReader !== 'function') {
      reject('Browser does not support FileReader');
    }

    if (!f) {
      reject("Please select a file");
    } else if (f.type !== 'application/json') {
      reject('File is not a JSON')
    } else {
      let fr = new window.FileReader();
      fr.onload = function (data) {
        try {
          let tmp = data.target.result;
          JSON.parse(tmp);
          resolve(tmp)
        } catch (error) {
          reject('JSON file is corrupted')
        }
      };
      fr.readAsText(f);
    }
  })
};


/* Helper function that converts Wei to Ether*/
const toEther = function (priceInWei, web3) {
  if (web3 != null) {
    return web3.fromWei(priceInWei.toNumber(), 'ether');
  }
};

/*Helper function that converts Ether to Wei*/
const fromEther = function (priceInEth, web3) {
  if (web3 !== null) {
    return web3.toWei(priceInEth, 'ether');
  }
};


module.exports = {
  getFileHash,
  getEncryptedFileBuffer,
  extractJson,
  toEther,
  fromEther
};


