

import {LARGE_FILE} from "./ErrorHandler";
import {Constants} from "../Constants";

/*Function that triggers the download of the given bytes*/
const saveByteArray = (name, bytes, window, document) => {
  let blob = new Blob([bytes]);
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = name + ".pdf";
  link.click();
};

/*Utility function that extracts the json from a file and returns a promise that resolves into the json object,
* or is rejected if the parsing could not occur*/
const extractJson = (file, window)  => {
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

/*Converts a unix timestamp to a String with date and time*/
const stampToDate = (timestamp) => {
  let date = new Date(timestamp * 1000);
  return date.toDateString() + " at " + date.toTimeString();
};

const successfullTx = (tx) => {
  return "Successful, transaction hash :" + tx.tx
};

/* Helper function that converts Wei to Ether*/
const toEther = (priceInWei, web3) => {
  if (web3 != null) {
    return web3.fromWei(priceInWei.toNumber(), 'ether');
  }
};

/*Helper function that converts Ether to Wei*/
const fromEther = (priceInEth, web3) => {
  if (web3 !== null) {
    return web3.toWei(priceInEth, 'ether');
  }
};

/*Utility function to validate emails*/
const validateEmail = (email, repeat) => {
  if (email === "") {
    return null;
  } else if (email === repeat) {
    return 'success'
  } else if (email.includes(repeat)) {
    return 'warning';
  } else {
    return 'error'
  }
};

/*Utility function that returns true if the file is in PDF and less than 10Mb*/
const validatePDF = (file) => {
  if (file === "") {
    alert('Please select a file');
  } else if (file.size > Constants.MAX_FILE_SIZE) {
    alert(LARGE_FILE)
  } else if (file.type !== 'application/pdf') {
    alert('File must be in PDF format');
  }
  return file !== "" && file.type === 'application/pdf' && file.size < Constants.MAX_FILE_SIZE;
};



module.exports = {
  extractJson,
  saveByteArray,
  stampToDate,
  successfullTx,
  toEther,
  fromEther,
  validatePDF,
  validateEmail
};


