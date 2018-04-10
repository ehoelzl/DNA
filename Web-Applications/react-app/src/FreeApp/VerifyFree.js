import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'
import TimeStamping from '../../build/contracts/TimeStamping'
import {FieldGroup, SubmitButton} from '../utils/htmlElements';

import React, {Component} from 'react'
import {getFileHash} from "../utils/stampUtil";
import axios from "axios/index";

const SERVER_ADDRESS = 'http://127.0.0.1:4000';

class VerifyFree extends Component {

  constructor(props) {
    super(props);
    this.state = {
      documentHash: "",
      signature: "",
      waitingServer: false
    };

    this.resetState = this.resetState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.submitVerification = this.submitVerification.bind(this);
  }

  resetState() {
    this.setState({
      documentHash: "",
      signature: "",
      waitingServer: false
    })
  }

  handleChange(e){
    e.preventDefault();
    if (e.target.name === 'file') {
      getFileHash(e.target.files[0], window).then(res => this.setState({documentHash: res})).catch(err => console.log(err))
    } else if (e.target.name === 'signature'){
      this.setState({signature : e.target.files[0]});
    }
  }

  submitVerification(e){
    e.preventDefault();

    if (this.validateForm()){
      console.log('sending');
      axios({
        method: 'post',
        url: SERVER_ADDRESS,
        data: this.state.signature
      }).then(res => {
        console.log(res)
      }).catch(e => console.log(e))
    } else {
      this.resetState()
    }
  }


  validateForm(){
    if (this.state.signature === "" || this.state.hash === ""){
      alert("Please verify the files");
      return false
    } else {
      if (this.state.signature.type !== 'application/json'){
        alert('The signature must be a JSON file')
      }
      return this.state.signature.type === 'application/json' && this.state.hash !== ""
    }
  }

  render() {
    return (
      <div className="time-stamp-container">
        <h3>TimeStamping contract at {TimeStamping.networks[3].address} (Ropsten Testnet)</h3>
        <form className="form-container" onSubmit={this.submitVerification}>
          <FieldGroup name="file" id="formsControlsFile" label="File" type="file" placeholder="" help="File to verify"
                      onChange={this.handleChange}/>
          <FieldGroup name="signature" id="formsControlsFile" label="Signature" type="file" placeholder=""
                      help="Signature of the file (.json file)" onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingServer}/>
        </form>
      </div>
    )

  }

}

export default VerifyFree