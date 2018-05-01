const IPFS = require('ipfs');
const fs = require('fs');

class Patenting{

  constructor(cypher){
    this.node = new IPFS();
    this.cypher = cypher;
    this.node.on('ready', () => console.log('IPFS node ready'));
  }

  addFile(file){
    return this.node.files.add(fs.createReadStream(file.path))
  }


}

module.exports = Patenting;