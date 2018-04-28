
import '../css/Pages.css'


import React, {Component} from 'react'
import {getFileHash} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, ContractNotFound, stampContainer} from '../utils/htmlElements';

import TimeStamping from '../../build/contracts/TimeStamping'

/*Class for Timestamp Verification and signature
*
* Uses the injected Web3 object to communicate with the contract
* */
class VerifyMetaMask extends Component {

  /*Constructor for the class*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      contractAddress: 0,
      hash: "",
      timestamp : 0,
      user : 0
    };

    this.submitFile = this.submitFile.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  /*Instantiate the contract before mounting the component*/
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {

      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
    }).catch(error => this.resetForm())
  }

  /*Helper method to reset the form*/
  resetForm(){
    this.setState({hash : "", timestamp : 0, user : 0});
  }

  /*Handles the changes of the form fields */
  handleChange(e){
    e.preventDefault();
    if (e.target.name === 'file') {
      getFileHash(e.target.files[0], window).then(res => this.setState({hash : res})).catch(err => console.log(err))
    }
  }

  /*Submits the file to the Contract to verify a timestamp*/
  submitFile(e){
    e.preventDefault();
    if (this.state.hash !== "") {
      this.state.contractInstance.getTimestamp.call(this.state.hash).then(res => {
        this.setState({timestamp : res});
        return this.state.contractInstance.getUser.call(this.state.hash);
      }).then(res => this.setState({user : res})).catch(error => console.log('Error from contract' + error));
    } else {
      alert("Please select a file");
      this.resetForm();
    }
  }


  renderForm(){
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>TimeStamping contract at {this.state.contractAddress}</div>
        <form className="form" onSubmit={this.submitFile}>
          <FieldGroup name="file"  id="formsControlsFile" label="File" type="file" placeholder="" help="File to verify" onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingTransaction}/>
        </form>
        {stampContainer(this.state.timestamp, this.state.user)}
      </div>

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

export default VerifyMetaMask