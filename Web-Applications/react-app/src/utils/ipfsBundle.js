import {getEncryptedFileBuffer, getDecryptedFileBuffer} from './CryptoUtils'
import {KEY_ERROR, IPFS_ERROR} from '../utils/ErrorHandler'
import sha256 from 'sha256'

/*Simple bundle to upload and get files to IPFS*/
class Bundle {
  constructor() {
    this.node = window.IpfsApi(process.env.REACT_APP_IPFS, 5001, {protocol: 'https'});
    this.encryptedFile = null;
  }

  reset() {
    this.encryptedFile = null;
  }

  /*Function that encrypts the file and stores it*/
  encryptFile(file, key) {
    return getEncryptedFileBuffer(file, window, key).then(res => {
      this.encryptedFile = res;
      return this.getHash()//new Promise((resolve, reject) => resolve("file encrypted"))
    })
  }

  /*Gets the IPFS hash of the stored encrypted file*/
  getHash = () => this.addFile(true);

  addFile(onlyHash = false) {
    if (this.encryptedFile !== null) {
      return this.node.files.add(this.encryptedFile, {onlyHash: onlyHash})
    }
  }

  /*Gets the byte buffer from IPFS and decrypts it using the given key*/
  getDecryptedFile(fileHash, ipfsLoc, key) {
    return new Promise((resolve, reject) => {
      if (fileHash !== null && ipfsLoc !== null && key !== null) {
        this.node.files.get(ipfsLoc, (err, files) => {
          if (!err) {
            let byteContent = files[0].content;
            let decrypted = getDecryptedFileBuffer(byteContent, key);
            let hash = sha256(decrypted);
            if (hash === fileHash) {
              resolve(decrypted)
            } else {
              reject(KEY_ERROR)
            }
          } else {
            reject(IPFS_ERROR)
          }
        })
      } else {
        reject(IPFS_ERROR)
      }
    })
  }


}

export default Bundle;
