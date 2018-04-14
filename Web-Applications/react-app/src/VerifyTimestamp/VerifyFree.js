import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'
import TimeStamping from '../../build/contracts/TimeStamping'
import {FieldGroup, SubmitButton} from '../utils/htmlElements';

import React, {Component} from 'react'
import {getFileHash, extractJson} from "../utils/stampUtil";
import axios from "axios/index";

const SERVER_ADDRESS = 'http://127.0.0.1:4000';
const OPERATION = 'verify';

const SIGNATURE = 'signature';
const FILE = 'file';

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
    this.setState({hash: "", signature: "", waitingServer: false});
  }


  /* Handles the changes in the form elements (two documents to upload)
  *
  * TODO : change error handling
  * */
  handleChange(e) {
    e.preventDefault();
    if (e.target.name === FILE) {
      getFileHash(e.target.files[0], window).then(res => {
        console.log(res);
        this.setState({hash: res})
      }).catch(err => console.log(err))
    } else if (e.target.name === SIGNATURE) {
      extractJson(e.target.files[0], window).then(res => {
        console.log(res);
        this.setState({signature: res})
      }).catch(err => {
        alert(err);
      })

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
        operation: OPERATION,
        hash: this.state.hash,
        signature: this.state.signature
      };

      console.log('sent' + JSON.stringify(data));
      //data.submit(SERVER_ADDRESS, (err, res) => console.log(err, res));
      axios({
        method: 'post',
        url: SERVER_ADDRESS,
        data: JSON.stringify(data), //this.state.signature//JSON.stringify(data)//this.state.signature
      }).then(res => {
        alert(res.data);
        console.log(res); // TODO : receive response and share with user
        this.resetState();
      }).catch(e => {
        console.log(e); // TODO : share error message with user
        this.resetState()
      })
    } else {
      this.resetState()
    }
  }

  /* Validates the documents and verifies that the signature is a non corrupted json string
  * */
  validateForm() {
    if (this.state.signature === "" || this.state.hash === "") {
      alert("Please verify the files");
      return false
    } else {
      return this.state.signature !== "" && this.state.hash !== ""
    }
  }

  /* The rendering method
  * */
  render() {
    return (
      <div className="time-stamp-container">
        <h3>TimeStamping contract at {TimeStamping.networks[3].address} (Ropsten Testnet)</h3>
        <form className="form-container" onSubmit={this.submitVerification}>
          <FieldGroup name={FILE} id="formsControlsFile" label="File" type="file" placeholder="" help="File to verify"
                      onChange={this.handleChange}/>
          <FieldGroup name={SIGNATURE} id="formsControlsFile" label="Signature" type="file" placeholder=""
                      help="Signature of the file (.json file)"  onChange={this.handleChange}/>
          <SubmitButton running={this.state.waitingServer}/>
        </form>
      </div>
    )

  }

}

export default VerifyFree