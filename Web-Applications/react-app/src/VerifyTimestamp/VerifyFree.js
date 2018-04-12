import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'
import TimeStamping from '../../build/contracts/TimeStamping'
import {FieldGroup, SubmitButton} from '../utils/htmlElements';

import React, {Component} from 'react'
import {getFileHash} from "../utils/stampUtil";
import FormData from "form-data";
import axios from "axios/index";

const SERVER_ADDRESS = 'http://192.168.43.36:4000'//'http://127.0.0.1:4000';

/*
* Component that serves to verify a timestamp of a document that has been done on the free platform
*
* The user is required to upload the document that has been signed and the signature which is a .json file
*
* It does not require a Web3 injection
* */
class VerifyFree extends Component {

  /* Constructor of the component
  * */
  constructor(props) {
    super(props);
    this.state = {
      hash: "",
      signature: "",
      signatureFile : null,
      waitingServer: false
    };

    this.resetState = this.resetState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.submitVerification = this.submitVerification.bind(this);
  }

  /* Resets the state of the component
  * */
  resetState() {
    this.setState({hash: "", signature: "", signatureFile : null, waitingServer: false});
  }


  /* Handles the changes in the form elements (two documents to upload)
  * */
  handleChange(e) {
    e.preventDefault();
    if (e.target.name === 'file') {
      getFileHash(e.target.files[0], window).then(res => this.setState({hash: res})).catch(err => console.log(err))
    } else if (e.target.name === 'signature') {
      if (e.target.files[0].type === 'application/json') {
        this.setState({signatureFile : e.target.files[0]});
        getFileHash(e.target.files[0], window, false).then(res => this.setState({signature : res})).catch(err => console.log(err))
      }
    }
  }

  /* This method sends the documents to the server for verification and transmits the response to the user
  *  TODO :  Complete this method once the server is operational
  *  TODO : Error handling
  *
  * */
  submitVerification(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingServer: true});

      let data = {
        hash : this.state.hash,
        signature : this.state.signature
      };


      //data.submit(SERVER_ADDRESS, (err, res) => console.log(err, res));
      axios({
        method: 'post',
        url: SERVER_ADDRESS,
        data: JSON.stringify(data), //this.state.signature//JSON.stringify(data)//this.state.signature
      }).then(res => {
        console.log(res);
        this.resetState();
      }).catch(e => {
        console.log(e);
        this.resetState()
      })
    } else {
      this.resetState()
    }
  }

  /* Validates the documents and verifies that the signature is a json file
  * */
  validateForm() {
    console.log(this.state.signature);
    if (this.state.signature === "" || this.state.hash === "") {
      alert("Please verify the files");
      return false
    } else {
      if (this.state.signatureFile.type !== 'application/json') {
        alert('The signature must be a JSON file')
      }
      return this.state.signatureFile.type === 'application/json' && this.state.hash !== ""
    }
  }

  /* The rendering method
  * */
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