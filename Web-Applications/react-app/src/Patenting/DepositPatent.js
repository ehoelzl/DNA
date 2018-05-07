import React, {Component} from 'react';
import {FieldGroup, SubmitButton, ContractNotFound} from '../utils/htmlElements';
import {getFileHash, toEther, fromEther} from '../utils/stampUtil';
import Patenting from '../../build/contracts/Patenting';
import Bundle from '../utils/ipfsBundle'
import Constants from '../Constants'
import {validateEmail} from '../utils/htmlElements'


class DepositPatent extends Component {


  constructor(props) {
    super(props);
    this.bundle = new Bundle();
    this.state = {
      hash: "",
      ipfsLocation: "",
      patentName: "",
      rentalPrice: 0,
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

  resetForm() {
    this.setState({
      hash: "",
      ipfsLocation: "",
      patentName: "",
      rentalPrice: 0,
      file: "",
      email_address: "",
      repeat_email: "",
      waitingTransaction: false
    })
  }

  componentWillMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentPrice.call()
    }).then(price => this.setState({patentPrice: toEther(price, this.state.web3)}))
      .catch(error => console.log(error.message));
  }

  static header() {
    return (
      <section className="header">
        <div className="title">
          Patent Registration
        </div>
        <p className="paragraph">This page allows users that have an Ethereum account and are using it on the Metamask
          extension for browsers, to register PDF documents and allow other users to access the document for a small
          fee. <br/> Whenever another user rents access to the document you uploaded, the funds will be transfered to
          you,
          and you will receive an email.

          <br/><br/>You only need to unlock your Metamask extension and choose the document.
          <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved. The
          document will be stored in an encrypted format on
          the IPFS network
        </p>
      </section>
    );
  }

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

  validatePrice() {
    if (!isNaN(this.state.rentalPrice)) {
      let price = parseInt(this.state.rentalPrice, 10);
      return price <= 1 && price >= 0;
    }
    return false
  }


  validateFile() {
    if (this.state.file.type === "") {
      alert('Please select a file');
    } else if (this.state.file.type !== 'application/pdf') {
      alert('File must be in PDF format');
    }
    return this.state.file !== "" && this.state.file.type === 'application/pdf';
  }

  validateForm() {
    return (this.validateFile() && this.validatePrice() && this.validateName() === 'success' && this.state.hash !== "" && this.state.ipfsLocation !== "")
  }


  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      let file = e.target.files[0];
      this.setState({file: file});
      this.bundle.addFile(file, window, true).then(files => this.setState({ipfsLocation: files[0].path})).catch(err => alert(err.message)); //Only get the hash of IPFS
      getFileHash(file, window).then(res => this.setState({hash: res, file: file})).catch(err => alert(err.message)); // Here we get the sha256 hash of the doc
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }
  }

  submitPatent(e) {
    e.preventDefault();

    if (this.validateForm()) {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.depositPatent(this.state.patentName, this.state.hash, fromEther(this.state.rentalPrice, this.state.web3), this.state.ipfsLocation, this.state.email_address, {
        from: this.state.web3.eth.coinbase,
        value: fromEther(this.state.patentPrice, this.state.web3),
        gas: Constants.GAS_LIMIT
      }).then(tx => {
        return this.bundle.addFile(this.state.file, window)
      }).then(filesAdded => {
        alert("Patent has been added, IPFS link : ipfs.io/ipfs/" + filesAdded[0].path);
        this.resetForm();
      }).catch(error => { //TODO : change error handling
        console.log(error);
        alert("There was a problem while depositing patent.");
        this.resetForm();
      });
    } else {
      alert('Please verify your information');
      this.resetForm()
    }

  }

  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>Patenting contract at {this.state.contractInstance.address} <br/> Patent
          price at {this.state.patentPrice} ETH
          <br/> Current account {this.state.web3.eth.accounts[0]} (From Metamask)
        </div>
        <form className="form" onSubmit={this.submitPatent}>
          <FieldGroup name="patentName" id="formsControlsName" label="Patent Name" type="text"
                      value={this.state.patentName} placeholder="Enter the Patent name" help="Max 100 chars"
                      onChange={this.handleChange} validation={this.validateName()}/>
          <FieldGroup name="rentalPrice" id="formsControlsName" label="Rental price in ETH" type="text"
                      value={this.state.rentalPrice} help="Max 1 ETH"
                      onChange={this.handleChange}/>
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
      </div>
    );
  }

  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return this.renderForm()
    }
  }
}

export default DepositPatent;