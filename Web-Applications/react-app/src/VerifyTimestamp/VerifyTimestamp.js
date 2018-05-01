import '../css/Pages.css'


import React, {Component} from 'react'
import {ButtonGroup, Button} from 'react-bootstrap'
import MetaMaskApp from '../MetaMaskApp';
import VerifyMetaMask from "./VerifyMetaMask";
import VerifyFree from "./VerifyFree";

const METAMASK = 1;
const SERVER = 2;

class VerifyTimestamp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedService: null,
      loadChild: false
    };

    this.resetState = this.resetState.bind(this);
  }

  resetState() {
    this.setState({
      selectedService: null,
      loadChild: false
    })
  }


  setService(service) {
    if (service === METAMASK || service === SERVER) {
      this.setState({selectedService: service, loadChild: true});
    }
  }


  buttons() {
    return (
      <ButtonGroup bsSize="large">
        <Button onClick={this.setService.bind(this, METAMASK)} disabled={this.state.selectedService === METAMASK}>Metamask Client</Button>
        <Button onClick={this.setService.bind(this, SERVER)} disabled={this.state.selectedService === SERVER}>Server</Button>
      </ButtonGroup>
    )
  }

  /*buttons() {
    return (<div className="pure-button-group xlarge">
      <button className="pure-button" onClick={this.setService.bind(this, METAMASK)}>Metamask Client</button>
      <button className="pure-button" onClick={this.setService.bind(this, SERVER)}>Server</button>
    </div>);
  }*/

  renderChild() {
    let child;
    if (this.state.loadChild) {
      switch (this.state.selectedService) {
        case METAMASK:
          child = <MetaMaskApp component={VerifyMetaMask.name}/>;
          break;
        case SERVER:
          child = <VerifyFree/>;
          break;
        default :
          child = "";
          break;
      }
    }

    return (
      <div className="metamask-container">
        <div className='buttons-container'>{this.buttons()}</div>
        {child}
      </div>
    );
  }

  render() {
    return (
      <div className='app-container'>
      <section className='header'>
        <div className='title'>Time-stamp verification</div>
        <p className='paragraph'>
          This page allows user to verify the time-stamp of a document.
          <br/><br/>If the document was time-stamped using an Ethereum account, you will only need to upload the document.
          Otherwise, you must include the signature we sent back when the document was time-stamped.
        </p>
      </section>
        {this.renderChild()}
      </div>

    );
  }
}

export default VerifyTimestamp