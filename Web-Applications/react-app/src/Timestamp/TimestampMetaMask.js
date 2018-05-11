import '../css/Pages.css'
import React, {Component} from 'react'
import TimeStamping from '../../build/contracts/TimeStamping'
import {getFileHash, toEther, fromEther} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, ContractNotFound} from '../utils/htmlElements';
import Constants from '../Constants'

import {INVALID_FORM, LARGE_FILE, contractError} from '../utils/ErrorHandler'
import wrapWithMetamask from "../MetaMaskWrapper";

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/*Component that handles the submission of a Timestamp by directly communicating with the contract itself
* Requires a Web3 object to be passed in as a Props
*
* Page at "/PersonalTimestamp"
* */
class TimestampMetaMask_class extends Component {

  /* Constructor for the Timestamping form
  * */
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      waitingTransaction: false,
      contractInstance: null,
      contractAddress: 0,
      stampPrice: 0,
      hash: ""
    };

    //Bindings for helper methods
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }


  /*Override : Save the contract instance in the page state using the injected Web3 object (Metamask)
  * Saves the contract instance, its address and the Stamp price in Ether
  * */
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
      return instance.price.call()
    }).then(price => this.setState({stampPrice: toEther(price, this.state.web3)}))
      .catch(error => console.log(error)); //TODO : change this error handler
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Helper method that resets the form fields
  */
  resetForm() {
    this.setState({hash: "", waitingTransaction: false});
  }


  /* Helper method specific to this form
  * Returns true if the client is not waiting for another transactions and if the form fields are correctly set
  * */
  validateForm() {
    return (!(this.state.waitingTransaction || this.state.hash === ""));
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /* Method is called when the submit button is pressed.
  * It expects to find all the form fields in the page state and executes the transaction via the Metamask client
  * Alerts the user in case the process did not complete and resets the form fields
  * */
  submitTimestamp(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.stamp(this.state.hash, {
        from: this.state.web3.eth.coinbase,
        value: fromEther(this.state.stampPrice, this.state.web3),
        gas: Constants.GAS_LIMIT
      }).then(tx => {
        alert("Timestamping successful, tx : " + tx.tx);
        this.resetForm();
      }).catch(err => {
        contractError(err);
        this.resetForm();
      });
    } else {
      alert(INVALID_FORM);
      this.resetForm();
    }
  }

  /*
  * Method that sets the state whenever a form field is changed
  * Uses getFileHash method from the utils to get the hash of the uploaded file.
  * The hash of the file only is stored
  * */
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


  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*
  * Form component
  * */
  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>TimeStamping contract at {this.state.contractAddress} <br/> Stamp price
          at {this.state.stampPrice} ETH <br/> Using address {this.state.web3.eth.coinbase}
        </div>
        <form className="form" onSubmit={this.submitTimestamp}>
          <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                      help="File you wish to timestamp" onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingTransaction}/>
        </form>
      </div>
    );
  }

  static header() {
    return (
      <section className="header">
        <div className="title">
          Document time-stamping
        </div>
        <p className="paragraph">This page allows users that have an Ethereum account and are using it on the Metamask
          extension for browsers,
          to time-stamp and sign documents with their address. Time-stamping is much more accurate and faster using
          this
          service.
          <br/><br/>You only need to <b>unlock your Metamask extension</b> and choose the document.
          <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved.
        </p>
      </section>
    );
  }

  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return this.renderForm();
    }
  }
}

const TimestampMetaMask =  wrapWithMetamask(TimestampMetaMask_class, TimestampMetaMask_class.header());
export default TimestampMetaMask;