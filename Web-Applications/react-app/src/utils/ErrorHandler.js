/*Helper functions for error handling and constant Error messages */

/*Error Messages*/
const INVALID_FORM = "The input information is incorrect, please try again";
const METAMASK_NOTFOUND = "You need a Metamask extension";
const UNLOCK_METAMASK = "Please unlock your Metamask extension and try again";
const INVALID_NETWORK = "Please choose the network that corresponds to your current Metamask account";
const LARGE_FILE = "File is too large (exceeds 10MB)";
const NOT_OWNER = "Not owner";
const ALREADY_REQUESTED = "You have already requested access to this patent";
const NOT_PENDING = "Request not pending";
const IPFS_ERROR = "There was an error communicating with IPFS";
const KEY_ERROR = "The key does not match";
const NOT_REQUESTED = "Patent not requested";
const KEY_GENERATION_ERROR = "Could not generate a key";
const ENCRYPTION_ERROR = "Error while encrypting";

/*Handles serer error*/
const serverError = function (error) {
  let message = error.message;
  if (message === 'Network Error') {
    window.dialog.showAlert('There was a problem relaying the information, please try again');
  } else if (error.response) {
    let statusMessage = error.response.data;
    window.dialog.showAlert('Error from server : ' + statusMessage)
  }
};


/*Handles contract call errors*/
const contractError = function (error) {
  let message = error.message.split('\n')[0];
  if (message === 'invalid address') {
    window.dialog.showAlert('Please check your MetaMask Client');
  } else {
    let tmp = message.split(' ');

    if (tmp.length > 0) {
      let status_code = tmp[tmp.length - 1][0];
      if (status_code === '0') {
        window.dialog.showAlert('Error from Contract')
      } else {
        window.dialog.showAlert('An Unknown error occurred')
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
  ALREADY_REQUESTED,
  NOT_OWNER,
  NOT_REQUESTED,
  NOT_PENDING,
  IPFS_ERROR,
  KEY_ERROR,
  KEY_GENERATION_ERROR,
  ENCRYPTION_ERROR,
  contractError,
  serverError
};