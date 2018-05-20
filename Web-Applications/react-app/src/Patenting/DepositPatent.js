import '../css/Pages.css'

import React, {Component} from 'react';
import {Button, Grid, Row, Col} from 'react-bootstrap';
import {FieldGroup, SubmitButton, ContractNotFound, validateEmail, validatePDF} from '../utils/HtmlElements';
import {getFileHash, toEther, fromEther} from '../utils/UtilityFunctions';
import wrapWithMetamask from '../MetaMaskWrapper'
import Patenting from '../../build/contracts/Patenting';
import Bundle from '../utils/ipfsBundle';

import Constants from '../Constants';
import {generatePrivateKey} from '../utils/KeyGenerator'
import {INVALID_FORM, KEY_GENERATION_ERROR, IPFS_ERROR, contractError} from '../utils/ErrorHandler'


const FileState = {
  NOT_ENCRYPTED: 0,
  ENCRYPTING: 1,
  ENCRYPTED: 2
};

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
      email_address: "",
      repeat_email: "",
      file: "",
      fileState: FileState.NOT_ENCRYPTED,
      web3: props.web3,
      contractInstance: null,
      waitingTransaction: false,
      patentPrice: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.submitPatent = this.submitPatent.bind(this);
    this.encryptFile = this.encryptFile.bind(this);
  }

  /*Called before the component is mounted
  * Instantiates the contract and stores the price of a patent*/
  componentDidMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentPrice.call()
    }).then(price => this.setState({patentPrice: toEther(price, this.state.web3)}))
      .catch(error => this.setState({contractInstance: null}));
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /*Resets the form*/
  resetForm() {
    this.bundle.reset();
    this.setState({
      hash: "",
      ipfsLocation: "",
      patentName: "",
      price: "",
      file: "",
      fileState: FileState.NOT_ENCRYPTED,
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

  /*Checks that 0 <= price <= 1 ETHER*/
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
    return (this.validatePrice() === 'success' && this.validateName() === 'success' && this.state.hash !== "" && this.state.ipfsLocation !== "" && this.state.fileState === FileState.ENCRYPTED)
  }


  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /*Encrypts the file using AES and the key produced by the owner*/
  encryptFile(e) {
    e.preventDefault();
    if (this.state.file !== "" && this.state.hash !== "" && this.state.fileState === FileState.NOT_ENCRYPTED) {
      this.setState({fileState: FileState.ENCRYPTING});
      generatePrivateKey(this.state.web3, this.state.hash).then(key => { // Ask user to generate key
        return this.bundle.encryptFile(this.state.file, key); // Encrypt file using the key
      }).then(res => {
        return this.bundle.getHash() // Get the IPFS location
      }).then(files => {
        this.setState({ipfsLocation: files[0].path, fileState: FileState.ENCRYPTED})
      }).catch(err => {
        if (err === KEY_GENERATION_ERROR) {
          alert(KEY_GENERATION_ERROR);
        } else {
          alert(IPFS_ERROR);
        }
        this.resetForm();
      })
    } else {
      alert("Please select a file.");
    }

  }


  /*Handles the change in a form component
  * Checks : size(File) < 10Mb and File is PDF
  * Computes : sha256 of the plain text document
  * */
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === Constants.FILE) {
      let file = e.target.files[0];
      if (validatePDF(file)) {
        this.setState({waitingTransaction: true, fileState: FileState.NOT_ENCRYPTED});
        getFileHash(file, window).then(res => {
          this.setState({hash: res, file: file, waitingTransaction: false})
        }).catch(err => alert(err));
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
        gas: process.env.REACT_APP_GAS_LIMIT
      }).then(tx => {
        return this.bundle.addFile() // Add the encrypted file to the
      }).then(filesAdded => {
        this.resetForm();
        alert("Patent has been added, IPFS link : ipfs.io/ipfs/" + filesAdded[0].path); //TODO : change strings to constants and add transaction hash
      }).catch(error => {
        this.resetForm();
        contractError(error); //Handles the error
      });
    } else {
      if (this.state.file !== "" && this.state.fileState === FileState.NOT_ENCRYPTED) {
        alert("Please encrypt the file")
      } else {
        alert(INVALID_FORM);
      }

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
            fee. <br/> Whenever another user requests to buy access to the document you uploaded, an email will be sent
            to you and
            you will need to <a href="/MyPatents" className="link">
              accept the requests</a>, then the funds will be transferred to
            your account and the user will be able to view the document.
            <br/><br/>You only need to <b>unlock your Metamask extension</b> and choose the document.
            <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved.
            The document will be stored in an encrypted format on the IPFS network, using AES 256-bit encryption
          </p>
        </Row>
      </Grid>
    );
  }

  /*Function that returns the "Encrypt file button" depending on the state*/
  encryptFileButton() {
    let buttonState, buttonText;
    let isLoading = this.state.fileState === FileState.ENCRYPTING;
    switch (this.state.fileState) {
      case FileState.NOT_ENCRYPTED:
        buttonState = "default";
        buttonText = "Encrypt File";
        break;
      case FileState.ENCRYPTING:
        buttonState = "default";
        buttonText = "Encrypting File..";
        break;
      case FileState.ENCRYPTED:
        buttonState = "success";
        buttonText = "File encrypted";
        break;
      default:
        break;
    }
    return (
      <Button bsStyle={buttonState} disabled={isLoading || this.state.fileState === FileState.ENCRYPTED} block
              onClick={isLoading ? null : this.encryptFile}>{buttonText}</Button>);
  }

  /*Renders the form to deposit a patent*/
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

        <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File of the patent (PDF only)" onChange={this.handleChange}/>

        {this.encryptFileButton()}
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
            <Col xsHidden>Patenting contract at {this.state.contractInstance.address}</Col>
            <Row>Patent price at {this.state.patentPrice} ETH </Row>
            <Row><Col xsHidden>Current account {this.state.web3.eth.accounts[0]} (From Metamask)</Col></Row>
          </Row>
          <Row><Col sm={3} md={5} mdOffset={3} className="form">{this.renderForm()}</Col></Row>
        </Grid>
      )
    }
  }
}

const DepositPatent = wrapWithMetamask(DepositPatent_class, DepositPatent_class.header());
export default DepositPatent;

