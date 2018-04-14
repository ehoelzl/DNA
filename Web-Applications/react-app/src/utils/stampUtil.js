import sha256 from "sha256";

/*
* Utility function to get the hash of a file
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

const extractJson = function (file, window) {
  return new Promise(function (resolve, reject) {
    let f = file;
    if (typeof window.FileReader !== 'function') {
      reject('Browser does not support FileReader');
    }

    if (!f) {
      reject("Please select a file");
    } else if (f.type !== 'application/json'){
      reject('File is not a JSON')
    } else {
      let fr = new window.FileReader();
      fr.onload = function (data){
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


/*
  * Helper function that converts Wei to Ether
  * */
const toEther = function (priceInWei, web3) {
  if (web3 != null) {
    return web3.fromWei(priceInWei.toNumber(), 'ether');
  }
};


module.exports = {
  getFileHash,
  extractJson,
  toEther,
};


