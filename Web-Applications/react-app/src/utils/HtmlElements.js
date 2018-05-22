import React, {Component} from 'react'

import {FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from 'react-bootstrap'
import Button from 'react-bootstrap-button-loader'
import '../css/Pages.css'
import Constants from '../Constants'
import {LARGE_FILE} from '../utils/ErrorHandler'

const RequestStatus = {
  NOT_REQUESTED: 0,
  PENDING: 1,
  REJECTED: 2,
  CANCELLED: 3,
  ACCEPTED: 4
};

const RequestStatus_String = {
  NOT_REQUESTED: "-",
  PENDING: "Pending",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  ACCEPTED: "Accepted"
};

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

/*Simple component to display when contract is not deployed*/
class ContractNotFound extends Component {
  render() {
    return (<div className="not-found">
      <h3>Contract not found on this Network, please try another network</h3>
    </div>);
  }
}

/*Converts a unix timestamp to a String with date and time*/
const stampToDate = function (timestamp) {
  let date = new Date(timestamp * 1000);
  return date.toDateString() + " at " + date.toTimeString();
};

/*Represents the container that display the given timestamp from the given user*/
const stampContainer = function (timestamp, user) {
  let container = "";
  if (timestamp !== 0) {
    let date = stampToDate(timestamp);
    container = <Alert bsStyle="success">Document timestamped on {date}<br/> By {user}</Alert>
  } else {
    container = <Alert bsStyle="danger">Document not found in Database</Alert>
  }
  return <div className="stamp-result">{container}</div>
};

/*Returns the string associated to the given status (Between 0 and 3)*/
const getStatusString = function (status) {
  switch (status.toNumber()) {
    case RequestStatus.NOT_REQUESTED:
      return RequestStatus_String.NOT_REQUESTED;
    case RequestStatus.PENDING:
      return RequestStatus_String.PENDING;
    case RequestStatus.REJECTED:
      return RequestStatus_String.REJECTED;
    case RequestStatus.ACCEPTED:
      return RequestStatus_String.ACCEPTED;
    default :
      return ""
  }
};

/*Utility function to validate emails*/
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

/*Utility function that returns true if the file is in PDF and less than 10Mb*/
const validatePDF = function (file) {
  if (file === "") {
    alert('Please select a file');
  } else if (file.size > Constants.MAX_FILE_SIZE) {
    alert(LARGE_FILE)
  } else if (file.type !== 'application/pdf') {
    alert('File must be in PDF format');
  }
  return file !== "" && file.type === 'application/pdf' && file.size < Constants.MAX_FILE_SIZE;
};

const successfulTx = function (tx){
  return "Successful, transaction hash :" + tx.tx
};

module.exports = {
  FieldGroup,
  SubmitButton,
  ContractNotFound,
  validateEmail,
  stampContainer,
  getStatusString,
  stampToDate,
  validatePDF,
  successfulTx,
  RequestStatus,
  RequestStatus_String
};
