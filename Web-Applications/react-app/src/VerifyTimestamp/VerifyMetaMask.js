import '../css/Pages.css'

import React, {Component} from 'react'
import {getFileHash} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, ContractNotFound, stampContainer} from '../utils/htmlElements';
import TimeStamping from '../../build/contracts/TimeStamping'
import Constants from '../Constants'
import {contractError, INVALID_FORM, LARGE_FILE} from '../utils/ErrorHandler'
import wrapWithMetamask from "../MetaMaskWrapper";

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/*Component for Timestamp and Signature Verification by directly communicating with the contract
* Uses the injected Web3 object to communicate with the contract
* */
class VerifyMetaMask_class extends Component {

  /*Constructor for the class*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      contractAddress: 0,
      hash: "",
      timestamp: 0,
      user: 0,
      displayResult : false
    };

    this.submitFile = this.submitFile.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  /*Override : Save the contract instance in the page state using the injected Web3 object (Metamask)
  * Saves the contract instance and its address
  * */
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
    }).catch(error => console.log(error)) // TODO : change this handler
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /*Helper method to reset the form*/
  resetForm() {
    this.setState({hash: "", timestamp: 0, user: 0, displayResult : false});
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/

  /*Handles the changes of the form fields */
  handleChange(e) {
    e.preventDefault();
    if (e.target.name === Constants.FILE) {
      let file = e.target.files[0];
      if (file.size < Constants.MAX_FILE_SIZE) {
        getFileHash(file, window).then(res => this.setState({hash: res})).catch(err => alert(err))
      } else {
        alert(LARGE_FILE)
      }
    }
  }

  /*Submits the file to the Contract to verify a timestamp and the address*/
  submitFile(e) {
    e.preventDefault();
    if (this.state.hash !== "") {
      this.state.contractInstance.getTimestamp.call(this.state.hash).then(res => {
        this.setState({timestamp: res.toNumber()});
        return this.state.contractInstance.getUser.call(this.state.hash);
      }).then(res => this.setState({user: res, displayResult : true}))
        .catch(error => {
          contractError(error);
          this.resetForm();
        });
    } else {
      alert(INVALID_FORM);
      this.resetForm();
    }
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Render results if displayResult = True*/
  searchResults(){
    if (this.state.displayResult){
      return stampContainer(this.state.timestamp, this.state.user)
    }
  }

  /*Form Rendering*/
  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>TimeStamping contract at {this.state.contractAddress}</div>
        <form className="form" onSubmit={this.submitFile}>
          <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                      help="File to verify"
                      onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingTransaction}/>
        </form>
        {this.searchResults()}
      </div>

    );
  }

  /*Component Rendering*/
  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return this.renderForm();
    }
  }
}
const VerifyMetaMask = wrapWithMetamask(VerifyMetaMask_class, "");
export default VerifyMetaMask
