import React, {Component} from 'react'

import {FormControl, FormGroup, ControlLabel, HelpBlock, Button} from 'react-bootstrap'
import '../App.css'

/*
* React Component for a FieldGroup (Form field with additional useful features)
* */
class FieldGroup extends Component{

  render(){
    return (
      <FormGroup controlId={this.props.id} validationState={this.props.validation}>
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl name={this.props.name} type={this.props.type} value={this.props.value} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
        <FormControl.Feedback/>
        {this.props.help && <HelpBlock>{this.props.help}</HelpBlock>}
      </FormGroup>
    );
  }
}

/*Submit button Component with loading state */
class SubmitButton extends Component {

  render() {
    let name = "btn btn-default ld-over-inverse";
    if (this.props.running) {
      name += ' running';
    }
    return (<Button type='submit' className={name} disabled={this.props.running}>
      Submit
      <div className="ld ld-hourglass ld-spin"/>
    </Button>);
  }
}

class ContractNotFound extends Component {
  render() {
    return (<div className="time-stamp-container">
      <h3>Contract not found on this Network, please try another network</h3>
    </div>);
  }
}

const validateEmail = function (email, repeat){
  if (email === "") {
    return null;
  } else if (email === repeat){
    return 'success'
  } else if (email.includes(repeat)){
    return 'warning';
  }  else {
    return 'error'
  }
};

module.exports = {
  FieldGroup,
  SubmitButton,
  ContractNotFound,
  validateEmail
};
