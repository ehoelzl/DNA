import '../css/Pages.css'

import React, {Component} from 'react'

import TimeStamping from '../../build/contracts/TimeStamping'
import {getFileHash, toEther} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, ContractNotFound, validateEmail} from '../utils/htmlElements';
import Constants from '../Constants'

/*Class that handles the submission of a Timestamp by directly communicating with the contract itself
*
* Requires Metamask of any other plugin that injects a Web3 object into the page
* */




class TimestampMetaMask extends Component {

  /*
  * Constructor for the Timestamping form on /PersonalTimestamp
  * */
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      waitingTransaction: false,
      contractInstance: null,
      contractAddress: 0,
      weiStampPrice: 0,
      etherStampPrice: 0,
      email_address: "",
      repeat_email: "",
      hash: ""
    };

    //Bindings for helper methods
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }


  /*
  * Override : Save the contract instance in the page state using the injected Web3 object (Metamask)
  * Saves the contract instance, its address and the Stamp price in Ether and Wei
  * TODO : ERROR hndling
  * */
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
      return instance.price.call()
    }).then(price => this.setState({weiStampPrice: price.toNumber(), etherStampPrice: toEther(price, this.state.web3)}))
      .catch(error => console.log(error));
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Helper method that resets the form fields
  */
  resetForm() {
    this.setState({email_address: "", repeat_email: "", hash: "", waitingTransaction: false});
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
        value: this.state.weiStampPrice,
        gas: Constants.GAS_LIMIT
      })
        .then(tx => {
          alert("Timestamping successful, tx : " + tx.tx);
          this.resetForm();
        })
        .catch(err => {
          let msg = err.message.split('\n')[0];
          TimestampMetaMask.handleStampError(msg);
          this.resetForm();
        });
    } else {
      alert('Please check your data before submitting');
      this.resetForm();
    }
  }

  /*
  * Error handling when submitting a Timestamp
  * */
  static handleStampError(message) {
    if (message === 'invalid address') {
      alert('Please check your MetaMask Client');
    } else {
      let tmp = message.split(' ');
      if (tmp.length > 0){
        let status_code = tmp[tmp.length - 1][0];
        if (status_code === '0') {
          alert('Error from Contract')
        } else {
          alert('An Unknown error occurred')
        }
      }
    }
  }

  /*
  * Method that sets the state whenever a form field is changed
  *
  * Uses getFileHash method from the utils to get the hash of the uploaded file.
  *
  * The hash of the file only is stored
  *
  * TODO : Change the error handling
  * */
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      getFileHash(e.target.files[0], window).then(res => this.setState({hash: res})).catch(err => console.log(err))
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }

  }


  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*
  * Form component
  * */
  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>TimeStamping contract at {this.state.contractAddress} <br/> Stamp price at {this.state.etherStampPrice} ETH</div>
        <form className="form" onSubmit={this.submitTimestamp}>
          <FieldGroup name="email_address" id="formsControlsEmail" label="Email address" type="email"
                      value={this.state.email_address} placeholder="Enter your email" help=""
                      onChange={this.handleChange}/>
          <FieldGroup name="repeat_email" id="formsControlsEmail" label="Email address" type="email"
                      value={this.state.repeat_email} placeholder="Re-enter your email" help=""
                      onChange={this.handleChange}
                      validation={validateEmail(this.state.email_address, this.state.repeat_email)}/>
          <FieldGroup name="file" id="formsControlsFile" label="File" type="file" placeholder=""
                      help="File you wish to timestamp" onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingTransaction}/>
        </form>
      </div>
    );
  }

  static header(){
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
          <br/><br/>You only need to unlock your Metamask extension and choose the document.
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

export default TimestampMetaMask;