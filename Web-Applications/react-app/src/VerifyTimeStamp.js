
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './css/loading-btn.css'
import './css/loading.css'
import './App.css'

import {Well} from 'react-bootstrap';

import React, {Component} from 'react'
import {getFileHash} from './utils/stampUtil';
import {FieldGroup, SubmitButton, ContractNotFound} from './utils/htmlElements';

import TimeStamping from '../build/contracts/TimeStamping'

/*Class for Timestamp Verification */
class VerifyTimeStamp extends Component {

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
    this.resetState = this.resetState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderSearchResults = this.renderSearchResults.bind(this);
  }

  /*Instantiate the contract before mounting the component*/
  componentWillMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance});
      this.setState({contractAddress: instance.address});
    }).catch(error => this.resetState())
  }

  /*Helper method to reset the state*/
  resetState(){
    this.setState({hash : "", timestamp : 0, user : 0});
  }

  /*Handles the changes of the form fields */
  handleChange(e){
    e.preventDefault();
    if (e.target.name === 'file') {
      //this.setState({file : e.target.files[0]});
      getFileHash(e.target.files[0], window).then(res => this.setState({hash : res})).catch(err => console.log(err))
    }
  }

  /*Submits the file to the Contract to verify a timestamp*/
  submitFile(e){
    e.preventDefault();
    if (this.state.hash !== "") {
      this.state.contractInstance.getTimestamp.call(this.state.hash).then(res => {
        let date = new Date(res*1000);
        this.setState({timestamp : date});
        return this.state.contractInstance.getUser.call(this.state.hash);
      }).then(res => this.setState({user : res})).catch(error => console.log('Error from contract' + error));
    } else {
      alert("Please select a file");
      this.resetState();
    }
  }


  renderSearchResults(){
    if (this.state.timestamp !== 0){
      return (<div className="time-stamp-container">
                <Well bsSize="large">Document timestamped on {this.state.timestamp.toDateString()} at {this.state.timestamp.toTimeString()}
                                     <br/> By account {this.state.user}
                </Well>
              </div>);
    }
  }

  renderForm(){
    return (
      <div className="time-stamp-container">
        <h3>TimeStamping contract at {this.state.contractAddress}</h3>
        <form className="form-container">
          <FieldGroup name="file"  id="formsControlsFile" label="File" type="file" placeholder="" help="File to verify" onChange={this.handleChange}/>
        </form>
        <SubmitButton running={this.state.waitingTransaction} onSubmit={this.submitFile}/>
        {this.renderSearchResults()}
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

export default VerifyTimeStamp
