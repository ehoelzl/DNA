const IPFS = require('ipfs');
const fs = require('fs');

class Patenting{

  constructor(cypher){
    this.node = new IPFS();
    this.cypher = cypher;
    //this.node.on('ready', () => console.log('IPFS node ready'));
  }

  addFile(file){
    //fs.readFile(file.path, )
    return this.node.files.add(fs.createReadStream(file.path), {onlyHash : true})//, {onlyHash : true})
  }


}

module.exports = Patenting;