import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'


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
      <div className="body-container">
        {this.buttons()}
        {child}
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Document time-stamp verification on the Ethereum Blockchain</h1>
            <h2>Use this page to verify the signature of a document</h2>
          </div>
        </div>
        {this.renderChild()}
      </div>
    );
  }
}

export default VerifyTimestamp