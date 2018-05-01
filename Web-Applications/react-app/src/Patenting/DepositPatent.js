import React, {Component} from 'react';
import axios from 'axios'
import {FieldGroup, SubmitButton, ContractNotFound} from '../utils/htmlElements';
import {getFileHash, toEther} from '../utils/stampUtil';
import Patenting from '../../build/contracts/Patenting';

import Constants from '../Constants'

const OPERATION = 'deposit';
const SERVER_ADDRESS = Constants.SERVER_IP + '/' + OPERATION;

class DepositPatent extends Component {

  constructor(props){
    super(props);
    this.state = {
      hash : "",
      ipfsLocation : "",
      patentName : "",
      rentalPrice : 0,
      web3 : props.web3,
      contractInstance : null,
      waitingTransaction : false,
      patentPrice : 0,
      file : ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.submitPatent = this.submitPatent.bind(this);
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

  static header(){
    return (
      <section className="header">
        <div className="title">
          Patent Registration
        </div>
        <p className="paragraph">This page allows users that have an Ethereum account and are using it on the Metamask
          extension for browsers, to register PDF documents and allow other users to access the document for a small fee. <br/>

          <br/><br/>You only need to unlock your Metamask extension and choose the document.
          <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved. The document will be stored in an encrypted format on
          the IPFS network
        </p>
      </section>
    );
  }

  validateName(){
    let length = this.state.patentName.length;
    if (length === 0){
      return null;
    } else if (length <= 100){
      return "success"
    } else {
      return "error";
    }
  }

  handleChange(e){
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      let file = e.target.files[0];
      this.setState({file : file});
      getFileHash(file, window).then(res => this.setState({hash: res})).catch(err => alert(err.message));
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }
  }

  submitPatent(e){
    e.preventDefault();
    let form = new FormData();
    form.append('file', this.state.file);
    axios({
      method : 'post',
      url : SERVER_ADDRESS,
      data : form
    }).then(res => {
      console.log(res.data, this.state, this.state.web3.eth.coinbase);
      this.state.contractInstance.depositPatent(
        this.state.patentName, this.state.hash, this.state.rentalPrice, res.data,
        {from: this.state.web3.eth.coinbase, value : this.state.web3.fromWei(this.state.patentPrice), gas :1000000}
        ).then(tx => console.log(tx)).catch(e => console.log(e))
    }).catch(e => console.log(e))
  }
  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>Patenting contract at {this.state.contractInstance.address} <br/> Patent price at {this.state.patentPrice} ETH
        <br/> Current account {this.state.web3.eth.accounts[0]} (From Metamask)</div>
        <form className="form" onSubmit={this.submitPatent}>
          <FieldGroup name="patentName" id="formsControlsName" label="Patent Name" type="text"
                      value={this.state.patentName} placeholder="Enter the Patent name" help="Max 100 chars."
                      onChange={this.handleChange} validation={this.validateName()}/>
          <FieldGroup name="file" id="formsControlsFile" label="File" type="file" placeholder=""
                      help="File you wish to timestamp" onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingTransaction}/>
        </form>
      </div>
    );
  }

  render(){
    if (this.state.contractInstance === null){
      return <ContractNotFound/>;
    } else {
      return this.renderForm()
    }
  }
}

export default DepositPatent