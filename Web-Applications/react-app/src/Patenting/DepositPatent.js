import '../css/Pages.css'

import React, {Component} from 'react';
import {FieldGroup, SubmitButton, ContractNotFound} from '../utils/htmlElements';
import {getFileHash, toEther, fromEther} from '../utils/stampUtil';
import wrapWithMetamask from '../MetaMaskWrapper'
import Patenting from '../../build/contracts/Patenting';
import Bundle from '../utils/ipfsBundle'
import Constants from '../Constants'
import {validateEmail, validatePDF} from '../utils/htmlElements'

import {Grid, Row, Col} from 'react-bootstrap'
import {INVALID_FORM, contractError} from '../utils/ErrorHandler'

/*Component for Patent Deposit*/
class DepositPatent_class extends Component {

  /*Component Constructor*/
  constructor(props) {
    super(props);
    this.bundle = new Bundle();
    this.state = {
      hash: "",
      ipfsLocation: "",
      patentName: "",
      price: "",
      file: "",
      email_address: "",
      repeat_email: "",
      web3: props.web3,
      contractInstance: null,
      waitingTransaction: false,
      patentPrice: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.submitPatent = this.submitPatent.bind(this);
  }

  /*Called before the component is mounted
  * Instantiates the contract and stores the price of a patent*/
  componentWillMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentPrice.call()
    }).then(price => this.setState({patentPrice: toEther(price, this.state.web3)}))
      .catch(error => console.log(error.message)); //TODO : change this error Handler
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /*Resets the form*/
  resetForm() {
    this.setState({
      hash: "",
      ipfsLocation: "",
      patentName: "",
      price: "",
      file: "",
      email_address: "",
      repeat_email: "",
      waitingTransaction: false
    })
  }

  /*Checks if Patent Name length is less than 100 */
  validateName() {
    let length = this.state.patentName.length;
    if (length === 0) {
      return null;
    } else if (length <= 100) {
      return "success"
    } else {
      return "error";
    }
  }

  /*Checks that 0 <= price <= 1*/
  validatePrice() {
    if (this.state.price === "") {
      return null
    } else if (!isNaN(this.state.price)) {
      let price = parseInt(this.state.price, 10);
      return (price <= 1 && price >= 0 ? 'success' : 'warning');
    } else {
      return 'error'
    }

  }

  /*Returns True if all form validation pass*/
  validateForm() {
    return (this.validatePrice() === 'success' && this.validateName() === 'success' && this.state.hash !== "" && this.state.ipfsLocation !== "")
  }


  /*Handles the change in a form component*/
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      let file = e.target.files[0];
      if (validatePDF(file)) { //Verifies that the file is in PDF and less than 10MB
        this.setState({file: file, waitingTransaction: true});
        this.bundle.addFile(file, window, true)
          .then(files => this.setState({ipfsLocation: files[0].path, waitingTransaction: false}))
          .catch(err => alert(err.message)); //Only get the hash of IPFS
        getFileHash(file, window).then(res => this.setState({hash: res, file: file})).catch(err => alert(err.message)); // Here we get the sha256 hash of the doc
      }
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }
  }

  /*Function that triggers the contract call to Deposit a patent*/
  submitPatent(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.depositPatent(this.state.patentName, this.state.hash, fromEther(this.state.price, this.state.web3), this.state.ipfsLocation, this.state.email_address, {
        from: this.state.web3.eth.coinbase,
        value: fromEther(this.state.patentPrice, this.state.web3),
        gas: Constants.GAS_LIMIT
      }).then(tx => {
        return this.bundle.addFile(this.state.file, window) //TODO : encrypt the file
      }).then(filesAdded => {
        alert("Patent has been added, IPFS link : ipfs.io/ipfs/" + filesAdded[0].path); //TODO : change strings to constants
        this.resetForm();
      }).catch(error => {
        contractError(error); //Handles the error
        this.resetForm();
      });
    } else {
      alert(INVALID_FORM);
      this.resetForm()
    }

  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*The header to be displayed*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>Patent Registration</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users that have an Ethereum account and are using it on the Metamask
            extension for browsers, to register PDF documents and allow other users to access the document for a set
            fee. <br/> Whenever another user rents access to the document you uploaded, the funds will be transferred to
            you,
            and you will receive an email.
            <br/><br/>You only need to <b>unlock your Metamask extension</b> and choose the document.
            <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved.
            The
            document will be stored in an encrypted format on
            the IPFS network
          </p>
        </Row>
      </Grid>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.submitPatent}>
        <FieldGroup name="patentName" id="formsControlsName" label="Patent Name" type="text"
                    value={this.state.patentName} placeholder="Enter the Patent name" help="Max 100 chars"
                    onChange={this.handleChange} validation={this.validateName()}/>
        <FieldGroup name="price" id="formsControlsName" label="Rental price in ETH" type="text"
                    value={this.state.price} help="Max 1 ETH"
                    onChange={this.handleChange} validation={this.validatePrice()}/>
        <FieldGroup name="email_address" id="formsControlsEmail" label="Email address" type="email"
                    value={this.state.email_address} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}/>
        <FieldGroup name="repeat_email" id="formsControlsEmail" label="Repeat Email address" type="email"
                    value={this.state.repeat_email} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}
                    validation={validateEmail(this.state.email_address, this.state.repeat_email)}/>
        <FieldGroup name="file" id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File of the patent (PDF only)" onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingTransaction}/>
      </form>
    );
  }

  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return (
        <Grid>
          <Row bsClass="contract-address">
            Patenting contract at {this.state.contractInstance.address} <br/>
            Patent price at {this.state.patentPrice} ETH<br/>
            Current account {this.state.web3.eth.accounts[0]} (From Metamask)
          </Row>
          <Row><Col sm={3} md={5} mdOffset={3} className="form">{this.renderForm()}</Col></Row>
        </Grid>
      )
    }
  }
}

const DepositPatent = wrapWithMetamask(DepositPatent_class, DepositPatent_class.header());
export default DepositPatent;

