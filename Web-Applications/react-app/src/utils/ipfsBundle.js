import Constants from '../Constants'
import {getFileBuffer} from './stampUtil'


/*Simple bundle to upload files to IPFS*/
class Bundle {

  constructor() {
    this.node = window.IpfsApi(Constants.IPFS_NODE, 5001, {protocol: 'https'})
  }

  getHash = (file, window) => this.addFile(file, window, true);

  addFile(file, window, onlyHash = false) {
    return getFileBuffer(file, window).then(res => {
      return this.node.files.add(res, {onlyHash: onlyHash})
    })
  }


}

export default Bundle;
