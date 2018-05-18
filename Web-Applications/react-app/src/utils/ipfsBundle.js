import Constants from '../Constants'
import {getEncryptedFileBuffer} from './UtilityFunctions'


/*Simple bundle to upload files to IPFS*/
class Bundle {

  constructor() {
    this.node = window.IpfsApi(process.env.REACT_APP_IPFS, 5001, {protocol: 'https'});
    this.encryptedFile = null;
  }

  reset(){
    this.encryptedFile = null;
  }

  /*Function that encrypts the file and stores it*/
  encryptFile(file, key) {
    return getEncryptedFileBuffer(file, window, key).then(res => {
      this.encryptedFile = res;
      return new Promise((resolve, reject) => resolve("file encrypted"))
    })
  }

  /*Gets the IPFS hash of the stored encrypted file*/
  getHash = () => this.addFile(true);

  addFile(onlyHash = false) {
    if (this.encryptedFile !== null) {
      return this.node.files.add(this.encryptedFile, {onlyHash: onlyHash})
    }
  }


}

export default Bundle;
