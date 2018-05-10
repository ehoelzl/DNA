

const INVALID_FORM = "The input information is incorrect, please try again";
const WEB3_ERROR = "You need a Metamask extension";
const INVALID_NETWORK = "Please choose the network that corresponds to your current Metamask account";
const LARGE_FILE = "File is too large (exceeds 10MB)";

const serverError = function (error){
  let message = error.message;
  if (message === 'Network Error') {
    alert('There was a problem relaying the information, please try again');
  } else if (error.response) {
    let statusMessage = error.response.data;
    alert('Error from server : ' + statusMessage)
  }
};

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
  WEB3_ERROR,
  INVALID_NETWORK,
  LARGE_FILE,
  contractError,
  serverError
};