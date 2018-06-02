import '../css/Pages.css'
import React, {Component} from 'react'
import axios from "axios/index";
import TimeStamping from '../../build/contracts/TimeStamping'
import {FieldGroup, StampContainer, SubmitButton} from '../utils/FunctionalComponents';
import {extractJson} from "../utils/UtilityFunctions";
import {getFileHash} from '../utils/CryptoUtils';
import {Constants} from '../Constants';
import {Grid, Row, Col} from 'react-bootstrap'

import {serverError, INVALID_FORM, LARGE_FILE} from '../utils/ErrorHandler'

const OPERATION = 'verify';
const SERVER_ADDRESS = process.env.REACT_APP_SERVER + '/' + OPERATION;

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/


/*
* Component that serves to verify a timestamp of a document that has been done on the free platform
* The user is required to upload the document that has been signed and the signature which is a .json file
* It does not require a Web3 injection, but communicates with the server
* */
class VerifyFree extends Component {

  /* Constructor of the component
  * */
  constructor(props) {
    super(props);
    this.state = {
      hash: "",
      signature: "",
      timestamp: 0,
      email: "",
      waitingServer: false,
      displayResult: false,
    };

    this.resetForm = this.resetForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.submitVerification = this.submitVerification.bind(this);
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Resets the state of the component
  * */
  resetForm() {
    this.setState({hash: "", signature: "", timestamp: 0, email: "", waitingServer: false, displayResult: false});
  }

  /* Validates the documents and verifies that the signature is a non corrupted json string
  * */
  validateForm() {
    return this.state.signature !== "" && this.state.hash !== ""
  }


  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /* Handles the changes in the form elements (two documents to upload) */
  handleChange(e) {
    e.preventDefault();
    if ([Constants.FILE, Constants.SIGNATURE].includes(e.target.name)) {
      let file = e.target.files[0];
      if (file.size < Constants.MAX_FILE_SIZE) {
        if (e.target.name === Constants.FILE) {
          getFileHash(file, window).then(res => this.setState({hash: res})).catch(err => window.dialog.showAlert(err))
        } else if (e.target.name === Constants.SIGNATURE) {
          extractJson(file, window).then(res => this.setState({signature: res})).catch(err => window.dialog.showAlert(err))
        }
      } else {
        window.dialog.showAlert(LARGE_FILE)
      }
    }
  }

  /* This method sends the documents to the server for verification and transmits the response to the user*/
  submitVerification(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingServer: true});

      let form = new FormData();
      form.append(Constants.HASH, this.state.hash);
      form.append(Constants.SIGNATURE, this.state.signature);

      axios({
        method: Constants.POST,
        url: SERVER_ADDRESS,
        data: form
      }).then(res => {
        let d = res.data;
        this.setState({timestamp: d.stamp, email: d.email, waitingServer: false, displayResult: true});
      }).catch(e => {
        serverError(e);
        this.resetForm()
      })
    } else {
      window.dialog.showAlert(INVALID_FORM);
      this.resetForm()
    }
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  renderForm() {
    return (
      <form onSubmit={this.submitVerification}>
        <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File to verify"
                    onChange={this.handleChange}/>
        <FieldGroup name={Constants.SIGNATURE} id="formsControlsFile" label="Signature" type="file" placeholder=""
                    help="Signature of the file (.json file)" onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingServer}/>
      </form>
    );
  }


  /* The rendering method
  * */
  render() {
    return (
      <Grid>
        <Row bsClass="contract-address"><Col xsHidden>TimeStamping contract
          at {TimeStamping.networks[3].address} (Ropsten
          Testnet)</Col></Row>
        <Row><Col sm={12} md={4} mdOffset={5}>
          {this.renderForm()}
        </Col></Row>
        <Row><Col sm={12} md={8} mdOffset={2}>{this.state.displayResult ? <StampContainer timestamp={this.state.timestamp} user={this.state.email}/> : ""}</Col></Row>
      </Grid>

    )

  }

}

export default VerifyFree