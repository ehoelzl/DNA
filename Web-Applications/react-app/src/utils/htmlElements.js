import React, {Component} from 'react'

import {FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from 'react-bootstrap'
import Button from 'react-bootstrap-button-loader'
import '../css/Pages.css'
import Constants from '../Constants'
import {LARGE_FILE} from '../utils/ErrorHandler'
/*
* React Component for a FieldGroup (Form field with additional useful features)
* */
class FieldGroup extends Component {

  render() {
    return (
      <FormGroup controlId={this.props.id} validationState={this.props.validation}>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl name={this.props.name} type={this.props.type} value={this.props.value}
                     placeholder={this.props.placeholder} onChange={this.props.onChange}/>
        <FormControl.Feedback/>
        {this.props.help && <HelpBlock>{this.props.help}</HelpBlock>}
      </FormGroup>
    );
  }
}

/*Submit button Component with loading state */
class SubmitButton extends Component {

  render() {
    return (<Button type='submit' loading={this.props.running} spinColor="#000">Submit</Button>);
  }
}

class ContractNotFound extends Component {
  render() {
    return (<div className="not-found">
      <h3>Contract not found on this Network, please try another network</h3>
    </div>);
  }
}

const stampToDate = function (timestamp) {
  let date = new Date(timestamp * 1000);
  return date.toDateString() + " at " + date.toTimeString();
};

const stampContainer = function (timestamp, user) {
  if (timestamp !== 0) {
    let date = stampToDate(timestamp);
    return (
      <div className="stamp-result"><Alert bsStyle="success">Document timestamped on {date}
        <br/> By {user}</Alert></div>)

  } else {
    return (<div className="stamp-result">
      <Alert bsStyle="danger">Document not found in Database</Alert>
    </div>)
  }
};

const validateEmail = function (email, repeat) {
  if (email === "") {
    return null;
  } else if (email === repeat) {
    return 'success'
  } else if (email.includes(repeat)) {
    return 'warning';
  } else {
    return 'error'
  }
};

const validatePDF = function (file){
  if (file === "") {
    alert('Please select a file');
  } else if (file.size > Constants.MAX_FILE_SIZE){
    alert(LARGE_FILE)
  } else if (file.type !== 'application/pdf') {
    alert('File must be in PDF format');
  }
  return file !== "" && file.type === 'application/pdf' && file.size < Constants.MAX_FILE_SIZE;
};

module.exports = {
  FieldGroup,
  SubmitButton,
  ContractNotFound,
  validateEmail,
  stampContainer,
  stampToDate,
  validatePDF
};
