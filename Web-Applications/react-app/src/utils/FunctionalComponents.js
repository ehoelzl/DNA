/*Set of React Components that are reused and are functional*/

import React from 'react'
import {FormControl, FormGroup, ControlLabel, HelpBlock, Alert} from 'react-bootstrap'
import Button from 'react-bootstrap-button-loader'
import '../css/Pages.css'


import {stampToDate} from './UtilityFunctions'
/*
* React Component for a FieldGroup (Form field with additional useful features)
* */
const FieldGroup = (props) => {
  return (
    <FormGroup controlId={props.id} validationState={props.validation}>
      <ControlLabel>{props.label}</ControlLabel>
      <FormControl name={props.name} type={props.type} value={props.value}
                   placeholder={props.placeholder} onChange={props.onChange}/>
      <FormControl.Feedback/>
      {props.help && <HelpBlock>{props.help}</HelpBlock>}
    </FormGroup>
  );
};

/*Submit button Component with loading state */
const SubmitButton = (props) => {
  return (<Button type='submit' loading={props.running} spinColor="#000">Submit</Button>);
};


/*Simple component to display when contract is not deployed*/
const ContractNotFound = (props) => {
  return (<div className="not-found">
    <h3>Contract not found on this Network, please try another network</h3>
  </div>);
};


/*Represents the container that display the given timestamp from the given user*/
const StampContainer = (props) => {
  let container = "";
  if (props.timestamp !== 0) {
    let date = stampToDate(props.timestamp);
    container = <Alert bsStyle="success">Document timestamped on {date}<br/> By {props.user}</Alert>
  } else {
    container = <Alert bsStyle="danger">Document not found in Database</Alert>
  }
  return <div style={{marginTop: '20px', textAlign: 'center', marginBottom: '100px'}}>{container}</div>
};


module.exports = {FieldGroup, SubmitButton, ContractNotFound, StampContainer};