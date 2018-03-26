import sha256 from "sha256";

/*
* Utility function to get the hash of a file
* */
var getFileHash = function (file, window){return new Promise(function(resolve, reject) {
  let f = file;//this.fileInput;
  if (typeof window.FileReader !== 'function') {
    reject('Browser does not support FileReader');
  }

  if (!f) {
    reject("Please select a file");
  } else {
    var fr = new window.FileReader();
    fr.onload = showResult;
    fr.readAsArrayBuffer(f);
  }

  function showResult(data) {
    var buffer = data.target.result;
    var bytes = new Uint8Array(buffer);
    resolve(sha256(bytes));

  }
})};

export default getFileHash
