/*This helper class contains functions and constants used across the website to handle Errors
*  TODO : Add error handler for contact instantiation
* */

/*Error Messages*/
const INVALID_FORM = "The input information is incorrect, please try again";
const METAMASK_NOTFOUND = "You need a Metamask extension";
const UNLOCK_METAMASK = "Please unlock your Metamask extension and try again";
const INVALID_NETWORK = "Please choose the network that corresponds to your current Metamask account";
const LARGE_FILE = "File is too large (exceeds 10MB)";
const ALREADY_AUTHORIZED = "You already are authorized for this patent";
const NOT_OWNER = "Not owner";
const ALREADY_REQUESTED = "You have already requested access to this patent";
const NOT_PENDING = "Request not pending";
const IPFS_ERROR ="There was an error communicating with IPFS";
const KEY_ERROR = "The key does not match";
const NOT_REQUESTED = "Patent not requested";
const KEY_GENERATION_ERROR = "Could not generate a key";

/*Handles serer error*/
const serverError = function (error) {
  let message = error.message;
  if (message === 'Network Error') {
    alert('There was a problem relaying the information, please try again');
  } else if (error.response) {
    let statusMessage = error.response.data;
    alert('Error from server : ' + statusMessage)
  }
};


/*Handles contract call errors*/
const contractError = function (error) {
  let message = error.message.split('\n')[0];
  if (message === 'invalid address') {
    alert('Please check your MetaMask Client');
  } else {
    let tmp = message.split(' ');
    if (tmp.length > 0) {
      let status_code = tmp[tmp.length - 1][0];
      if (status_code === '0') {
        alert('Error from Contract')
      } else {
        alert('An Unknown error occurred')
      }
    }
  }
};


module.exports = {
  INVALID_FORM,
  METAMASK_NOTFOUND,
  UNLOCK_METAMASK,
  INVALID_NETWORK,
  LARGE_FILE,
  ALREADY_AUTHORIZED,
  ALREADY_REQUESTED,
  NOT_OWNER,
  NOT_REQUESTED,
  NOT_PENDING,
  IPFS_ERROR,
  KEY_ERROR,
  KEY_GENERATION_ERROR,
  contractError,
  serverError
};