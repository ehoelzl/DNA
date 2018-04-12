import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import React, {Component} from 'react'
import {ButtonGroup, Button} from 'react-bootstrap'
import TimestampMetaMask from './Timestamp/TimestampMetaMask'
import VerifyMetaMask from './VerifyTimestamp/VerifyMetaMask'
import getWeb3 from './utils/getWeb3'

const MAINNET = 1;
const ROPSTEN = 3;
const KOVAN = 4;
const LOCALRPC = 5777;

const MAINNET_STRING = "Main Net";
const ROPSTEN_STRING = "Ropsten Test Net";
const KOVAN_STRING = "Kovan Test Net";
const LOCALRPC_STRING = "Local RPC";


/*
* This Web component communicates with the Web3 object injected by Metamask and handles the choice of Network
*
* This page requires a Web3 object injected into the web page
*
* The component passed to the constructor as a props is the Child component (Submit or verify timestamp)
* */
class MetaMaskApp extends Component {

  /* Constructor for the Component
  *
  * */
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      selectedNetwork: null,
      loadChild: false,
      childComponent: props.component
    };
    this.resetState = this.resetState.bind(this);

  }

  /* Resets the state of the Component*/
  resetState() {
    this.setState({
      web3: null,
      selectedNetwork: null,
      loadChild: false
    });
  }

  /* Tries to get the injected web3 object of the chosen network by Network ID
  * */
  getWeb3Object(networkId) {
    getWeb3.then(result => {
      this.setState({web3: result.web3});
      this.setNetwork(networkId);
    }).catch(e => {
      alert('Web3 not found ');
    });
  }

  /*Verifies the if the chosen network corresponds to the one in metamask
  * */
  setNetwork(networkId) {
    this.state.web3.version.getNetwork((err, id) => {
      id = parseInt(id, 10);
      if (id !== networkId) {
        alert("Please choose the network that corresponds to your current Metamask account");
        this.resetState();
      } else {
        switch (id) {
          case MAINNET:
            this.setState({selectedNetwork: MAINNET, loadChild: true});
            break;
          case ROPSTEN:
            this.setState({selectedNetwork: ROPSTEN, loadChild: true});
            break;
          case KOVAN:
            this.setState({selectedNetwork: KOVAN, loadChild: true});
            break;
          case LOCALRPC:
            this.setState({selectedNetwork: LOCALRPC, loadChild: true});
            break;
          default :
            this.setState({selectedNetwork: "Unknown Network", loadChild: false});
            break;
        }
      }
    })
  }


  /*
  * Returns a set of buttons that help choose the Network to timestamp on (Contract must have been deployed before)
  * */


  buttons() {
    return (
      <ButtonGroup bsSize="large">
        <Button onClick={this.getWeb3Object.bind(this, MAINNET)} disabled={this.state.selectedNetwork === MAINNET}>Ethereum Main Net</Button>
        <Button onClick={this.getWeb3Object.bind(this, ROPSTEN)} disabled={this.state.selectedNetwork === ROPSTEN}>Ropsten Test Net</Button>
        <Button onClick={this.getWeb3Object.bind(this, KOVAN)} disabled={this.state.selectedNetwork === KOVAN}>Kovan Test Net</Button>
        <Button onClick={this.getWeb3Object.bind(this, LOCALRPC)} disabled={this.state.selectedNetwork === LOCALRPC}>Local RPC</Button>
      </ButtonGroup>
    );
  }

  /*
  * Conditional rendering for the child component (either timestamping or verifying the timestamp)
  * */
  renderChild() {
    let child;
    if (this.state.loadChild) {
      switch (this.state.childComponent) {
        case TimestampMetaMask.name :
          child = <TimestampMetaMask web3={this.state.web3}/>;
          break;
        case VerifyMetaMask.name:
          child = <VerifyMetaMask web3={this.state.web3}/>;
          break;
        default:
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

  /*
  * Returns the string value of the chosen network to display
  * */
  currentNetwork() {
    if (this.state.selectedNetwork !== null) {
      switch (this.state.selectedNetwork) {
        case MAINNET :
          return <h3>Current network {MAINNET_STRING}</h3>;
        case ROPSTEN :
          return <h3>Current network {ROPSTEN_STRING}</h3>;
        case KOVAN :
          return <h3>Current network {KOVAN_STRING}</h3>;
        case LOCALRPC :
          return <h3>Current network {LOCALRPC_STRING}</h3>;
        default:
          break;
      }

    }
  }

  /*
  * Rendering for the page
  *
  * TODO : Arrange the buttons to react bootstrap
  * */
  render() {
    let header;
    if (this.state.childComponent === TimestampMetaMask.name) {
      header = <div className="pure-g">
                  <div className="pure-u-1-1">
                    <h1>Document time-stamping on the Ethereum Blockchain</h1>
                    <h2>Please choose the network to use</h2>
                    {this.currentNetwork()}
                  </div>
                </div>
              }
    return (
      <div className="container">
        {header}
        {this.renderChild()}
      </div>

    );
  }

}

export default MetaMaskApp