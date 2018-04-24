import '../css/Pages.css'

import axios from 'axios'
import React, {Component} from 'react'
import TimeStamping from '../../build/contracts/TimeStamping'
import {getFileHash} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, validateEmail} from '../utils/htmlElements';


/*Class that handles the submission of a Timestamp by relaying the data to the server
*
* Does not require Metamask or any Web3 object
* */

const SERVER_ADDRESS = 'http://192.168.43.217:4000'//'http://128.179.133.132:4000'//'http://127.0.0.1:4000';

const OPERATION = 'timestamp';

class TimestampFree extends Component {

  /*
  * Constructor for the Timestamping form on /Timestamp
  * */
  constructor(props) {
    super(props);
    this.state = {
      hash: "",
      email_address: "",
      repeat_email: "",
      waitingFeedback: false
    };

    //Bindings for helper methods
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetState = this.resetState.bind(this);
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Helper method that resets the form fields
  */
  resetState() {
    this.setState({email_address: "", repeat_email: "", hash: "", waitingFeedback: false});
  }


  /* Helper method specific to this form
  * Returns true if the form fields are correctly filled
  * */
  validateForm() {
    return (!(validateEmail(this.state.email_address, this.state.repeat_email) !== 'success' || this.state.hash === ""));
  }

  /*
  * Verifies that the server has the correct data
  * */
  verifyServerResponse(response) {
    let email = response.data.email;
    let hash = response.data.hash;
    return email === this.state.email_address && hash === this.state.hash
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /* Method is called when the submit button is pressed.
  * It expects to find all the form fields in the page state and relays the information to the server
  * Alerts the user in case the process did not complete and resets the form fields
  *
  * TODO : Coordinate on server response
  * */
  submitTimestamp(e) {
    e.preventDefault();

    if (this.validateForm()) {

      let data = {
        operation : OPERATION,
        email: this.state.email_address,
        hash: this.state.hash
      };

      this.setState({waitingFeedback: true});
      axios({
        method: 'post',
        url: SERVER_ADDRESS,
        data: JSON.stringify(data)
      }).then(res => {
        alert(res.data);
        this.resetState()
      }).catch(e => {
        TimestampFree.handleStampError(e);
        this.resetState();
      })

    } else {
      alert('Please verify your information' + this.state.hash);
      this.resetState();
    }
  }

  /*
  * Error handling when submitting a Timestamp
  * */
  static handleStampError(error) {
    let message = error.message;
    if (message === 'Network Error') {
      alert('There was a problem relaying the information, please try again');
    } else if (error.response) {
      let statusMessage = error.response.statusText;
      alert('Error from server : ' + statusMessage)
    }
  }

  /*
  * Method that sets the state whenever a form field is changed
  *
  * Uses getFileHash method from the utils to get the hash of the uploaded file.
  *
  * The hash of the file only is stored
  *
  * TODO : Change the error handling
  * */
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === 'file') {
      getFileHash(e.target.files[0], window).then(res => this.setState({hash: res})).catch(err => alert(err.message))
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }

  }


  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/


  renderForm() {
    return (
      <form className="form" onSubmit={this.submitTimestamp}>
        <FieldGroup name="email_address" id="formsControlsEmail" label="Email address" type="email"
                    value={this.state.email_address} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}/>
        <FieldGroup name="repeat_email" id="formsControlsEmail" label="Repeat Email address" type="email"
                    value={this.state.repeat_email} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}
                    validation={validateEmail(this.state.email_address, this.state.repeat_email)}/>
        <FieldGroup name="file" id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File you wish to timestamp" onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingFeedback}/>
      </form>
    );
  }

  /*
  * Form component
  *
  * */
  render() {
    return (
      <div className="app-container">
        <section className="header">
          <div className="title">Free document time-stamping
            <br/>
          </div>
          <p className="paragraph">This page allows any user with a valid email address to time-stamp a document of any
            given format in a secure and reliable way.
            <br/>The service provides less accuracy and only authenticity via the email.
            <br/>
            <br/>To time-stamp a document, please upload it and register your email. When the stamp is ready (10 to 30 minutes), you will
            receive an e-mail with the signature.
            <br/>
            <br/>
            <div className='time-stamp-header'>Time-stamping contract at {TimeStamping.networks[3].address} (Ropsten Testnet)</div>
          </p>
        </section>
        {this.renderForm()}
      </div>

    );
  }

}

export default TimestampFree;