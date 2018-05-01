const hash_regex= /\b[A-Fa-f0-9]{64}\b/;
const email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const CORRUPTED = 'Data is corrupted';
const NOT_FOUND = "No timestamp found in Database";
const NO_MATCH = 'Signature does not match';

class utils {

  static isEmail(str){
    return str !== undefined && str.match(email_regex) !== null;
  }
  /*Verifies that the given string matches the given regex*/
  static isHash(str){
    return str !== undefined && str.match(hash_regex) !== null;
  }

  /*Verifies that the given JSON file is a json*/
  static isSignature(json){
    let signature;
    try {
      signature = JSON.parse(json);
    } catch (error){
      return false;
    }
    for (let i=0; i<signature.length-1; i++){
      let level = signature[i];
      if (level['left'] === undefined || level['right'] === undefined) return false;
    }

    return this.isEmail(signature[signature.length - 1]['email'])
  }

}


module.exports = {
  utils,
  CORRUPTED,
  NOT_FOUND,
  NO_MATCH
};