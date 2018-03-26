import React, {Component} from 'react'

import {FormControl, FormGroup, ControlLabel, HelpBlock} from 'react-bootstrap'

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
export default FieldGroup;