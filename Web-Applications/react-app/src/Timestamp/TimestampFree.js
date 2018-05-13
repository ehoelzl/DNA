import '../css/Pages.css'
import axios from 'axios'
import React, {Component} from 'react'
import TimeStamping from '../../build/contracts/TimeStamping'
import {getFileHash} from '../utils/stampUtil';
import {FieldGroup, SubmitButton, validateEmail} from '../utils/htmlElements';
import Constants from '../Constants'
import {Grid, Row, Col} from 'react-bootstrap'
import {serverError, INVALID_FORM, LARGE_FILE} from '../utils/ErrorHandler'

const OPERATION = 'timestamp';
const SERVER_ADDRESS = Constants.SERVER_IP + '/' + OPERATION;


/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/


/*Component that handles the submission of a Timestamp by relaying the data to the server
* Does not require Metamask or any Web3 object
* */
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
      fileName: "",
      waitingFeedback: false
    };

    //Bindings for helper methods
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Helper method that resets the form fields
  */
  resetForm() {
    this.setState({email_address: "", repeat_email: "", hash: "", fileName: "", waitingFeedback: false});
  }


  /* Helper method specific to this form
  * Returns true if the form fields are correctly filled
  * */
  validateForm() {
    return (!(validateEmail(this.state.email_address, this.state.repeat_email) !== 'success' || this.state.hash === "" || this.state.fileName === ""));
  }


  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /* Method is called when the submit button is pressed.
  * It expects to find all the form fields in the page state and relays the information to the server
  * Alerts the user in case the process did not complete and resets the form fields
  * */
  submitTimestamp(e) {
    e.preventDefault();
    if (this.validateForm()) {
      let form = new FormData();
      form.append(Constants.EMAIL, this.state.email_address);
      form.append(Constants.HASH, this.state.hash);
      form.append(Constants.NAME, this.state.fileName);
      this.setState({waitingFeedback: true});
      axios({
        method: Constants.POST,
        url: SERVER_ADDRESS,
        data: form
      }).then(res => { //If response code is 200 OK
        alert(res.data);
        this.resetForm()
      }).catch(e => { //If response code is else than 200 OK
        serverError(e);
        this.resetForm();
      });
    } else {
      alert(INVALID_FORM);
      this.resetForm();
    }
  }


  /*
  * Method that sets the state whenever a form field is changed
  * Uses getFileHash method from the utils to get the hash of the uploaded file.
  *
  * The hash of the file only is stored
  * */
  handleChange(e) {
    e.preventDefault();
    let state = this.state;
    if (e.target.name === Constants.FILE) {
      let file = e.target.files[0];
      if (file.size < Constants.MAX_FILE_SIZE) {
        getFileHash(file, window).then(res => this.setState({hash: res, fileName: file.name})).catch(err => alert(err))
      } else {
        alert(LARGE_FILE)
      }
    } else {
      state[e.target.name] = e.target.value;
      this.setState(state);
    }
  }


  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/


  /*Form component*/
  renderForm() {
    return (
      <form onSubmit={this.submitTimestamp}>
        <FieldGroup name="email_address" id="formsControlsEmail" label="Email address" type="email"
                    value={this.state.email_address} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}/>
        <FieldGroup name="repeat_email" id="formsControlsEmail" label="Repeat Email address" type="email"
                    value={this.state.repeat_email} placeholder="john@doe.com" help=""
                    onChange={this.handleChange}
                    validation={validateEmail(this.state.email_address, this.state.repeat_email)}/>
        <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File you wish to timestamp" onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingFeedback}/>
      </form>
    );
  }

  /* Component rendering method
  * */
  render() {
    return (
      <Grid>
        <Row bsClass="title">Free document time-stamping</Row>
        <Row bsClass="paragraph">
          <p>This page allows any user with a valid email address to time-stamp a document of any
            given format in a secure and reliable way.
            <br/>The service provides less accuracy and only authenticity via the email.
            <br/>
            <br/>To time-stamp a document, please upload it and register your email. When the stamp is ready (10 to 30
            minutes), you will
            receive an e-mail with the signature. Please do not tamper with the signature file, as we will not be able
            to retrieve the time-stamp.
          </p>
        </Row>
        <Row bsClass="contract-address">
          Time-stamping contract at {TimeStamping.networks[3].address} (Ropsten Testnet)
        </Row>
        <Row><Col sm={3} md={5} mdOffset={3} className="form">{this.renderForm()}</Col></Row>
      </Grid>
    );
  }
}

export default TimestampFree;