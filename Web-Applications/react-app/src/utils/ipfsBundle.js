/*
import Constants from '../Constants'
import {getFileBuffer} from './stampUtil'

import IPFS from 'ipfs'

class Bundle {

  constructor() {
    this.node = new IPFS(Constants.IPFS_NODE, 5001, {protocol: 'https'})
  }


  addFile(file, window, onlyHash = false) {
    return getFileBuffer(file, window).then(res => {
      return this.node.files.add(res, {onlyHash : onlyHash})
    })
  }


}

export default Bundle;*/
