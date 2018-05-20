import '../css/Pages.css'
import React, {Component} from 'react'
import {ButtonGroup, Button, Grid, Row} from 'react-bootstrap'

import VerifyMetaMask from "./VerifyMetaMask";
import VerifyFree from "./VerifyFree";

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

const Service = {
  METAMASK: 1,
  SERVER: 2
};


/* Component that encapsulates both Timestamp Verification pages.
*  Renders its child depending on the chosen service (Metamask Client or Server)
*
*  Page at "/VerifyTimestamp"
* */
class VerifyTimestamp extends Component {

  /*Constructor method, initializes the state*/
  constructor(props) {
    super(props);
    this.state = {
      selectedService: null,
      loadChild: false
    };

    this.resetState = this.resetState.bind(this);
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /*Resets the state*/
  resetState() {
    this.setState({
      selectedService: null,
      loadChild: false
    })
  }

  /*Sets the selected service and checks if it is valid*/
  setService(service) {
    if (service === Service.METAMASK || service === Service.SERVER) {
      this.setState({selectedService: service, loadChild: true});
    }
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Button group to select the service*/
  buttons() {
    return (
      <ButtonGroup bsSize="large">
        <Button onClick={this.setService.bind(this, Service.METAMASK)}
                disabled={this.state.selectedService === Service.METAMASK}>Metamask
          Client</Button>
        <Button onClick={this.setService.bind(this, Service.SERVER)}
                disabled={this.state.selectedService === Service.SERVER}>Server</Button>
      </ButtonGroup>
    )
  }

  /*Conditional rendering of the child component depending on chosen service*/
  renderChild() {
    let child;
    if (this.state.loadChild) {
      switch (this.state.selectedService) {
        case Service.METAMASK:
          child = <VerifyMetaMask/>;
          break;
        case Service.SERVER:
          child = <VerifyFree/>;
          break;
        default :
          child = "";
          break;
      }
    }
    return child;
  }

  /*Rendering method of the Component*/
  render() {
    return (
      <Grid>
        <Row bsClass="title">Time-stamp verification</Row>
        <Row bsClass="paragraph">
          <p>
            This page allows user to verify the time-stamp of a document.
            <br/><br/>If the document was time-stamped using an Ethereum account, you will only need to upload the
            document.
            Otherwise, you must include the signature we sent back when the document was time-stamped.
          </p>
        </Row>
        <Row bsClass="buttons-container">{this.buttons()}</Row>
        <Row>{this.renderChild()}</Row>
      </Grid>
    );
  }
}

export default VerifyTimestamp