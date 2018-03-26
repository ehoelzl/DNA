import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './css/loading-btn.css'
import './css/loading.css'
import './App.css'

import React, {Component} from 'react'

import TimeStamping from '../build/contracts/TimeStamping'
import getFileHash from './utils/getFileHash';
import FieldGroup from './utils/htmlElements';

class TimeStampForm extends Component {

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
      hash: "",
    };

    this.toEther = this.toEther.bind(this);
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }


  //Instanciate contract corresponding to the network chosen
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
      return instance.price.call()
    }).then(price => this.setState({weiStampPrice: price.toNumber(), etherStampPrice: this.toEther(price)}));
  }


  toEther(priceInWei) {
    if (this.state.web3 != null) {
      return this.state.web3.fromWei(priceInWei.toNumber(), 'ether');
    }
  }


  //Form submission
  submitTimestamp(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.stamp(this.state.hash, {
        from: this.state.web3.eth.coinbase,
        value: this.state.weiStampPrice,
        gas: 500000
      })
        .then(tx => {
          alert("Timestamping successful, tx : " + tx.tx);
          this.resetForm();
        })
        .catch(err => {
          console.log(err.message.split('\n')[0])
          alert("Timestamping failed, please check the document");
          this.resetForm();
        });
    } else {
      alert('Please check your data before submitting');
      this.resetForm();
    }

  }

  validateForm(){
    return (!(this.state.waitingTransaction || this.state.hash === ""));
  }

  //For email validation
  validateEmail() {
    if (this.state.email_address === "") {
      return null;
    }
    return this.state.email_address !== this.state.repeat_email ? 'error' : 'success';
  }

  //Handles state changes form the form
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      //this.setState({file : e.target.files[0]});
      getFileHash(e.target.files[0], window).then(res => {this.setState({hash : res}); console.log(res)}).catch(err => console.log(err))
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }

  }

  //Resets the forms entries
  resetForm() {
    this.setState({email_address: "", repeat_email: "", waitingTransaction: false});
  }

  contractNotFound() {
    return (<div className="time-stamp-container">
              <h3>Contract not found on this Network, please try another network</h3>
            </div>);
  }


  submitButton() {
    let name = "btn btn-default ld-over-inverse";
    if (this.state.waitingTransaction) {
      name += ' running';
    }
    return (<div className={name} onClick={this.submitTimestamp}>
      Submit
      <div className="ld ld-hourglass ld-spin"/>
    </div>);
  }

  renderForm() {
    return (
      <div className="time-stamp-container">
        <h3>TimeStamping contract at {this.state.contractAddress}</h3>
        <h3>Stamp price at {this.state.etherStampPrice} ETH</h3>
        <form className="form-container">
          <FieldGroup name="email_address"  id="formsControlsEmail" label="Email address" type="email" value={this.state.email_address} placeholder="Enter your email" help="" onChange={this.handleChange}/>
          <FieldGroup name="repeat_email"  id="formsControlsEmail" label="Email address" type="email" value={this.state.repeat_email} placeholder="Re-enter your email" help="" onChange={this.handleChange} validation={this.validateEmail()}/>
          <FieldGroup name="file"  id="formsControlsFile" label="File" type="file" placeholder="" help="File you wish to timestamp" onChange={this.handleChange}/>
        </form>
        {this.submitButton()}

      </div>
    );
  }

  render() {
    if (this.state.contractInstance === null) {
      return this.contractNotFound();
    } else {
      return this.renderForm();
    }
  }
}

export default TimeStampForm;