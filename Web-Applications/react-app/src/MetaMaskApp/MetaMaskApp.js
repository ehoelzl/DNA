import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

import React, {Component} from 'react'
import TimestampMetaMask from './TimestampMetaMask'
import VerifyMetaMask from './VerifyMetaMask'
import getWeb3 from '../utils/getWeb3'

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
      childComponent : props.component
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
      this.verifyNetwork(networkId);
    }).catch(e => {
      alert('Web3 not found ');
    });
  }

  /*Verifies the if the chosen network corresponds to the one in metamask
  * */
  verifyNetwork(networkId) {
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
            this.setState({selectedNetwork : LOCALRPC, loadChild : true});
            break;
          default :
            this.setState({selectedNetwork: "Unknown Network", loadChild: false});
            break;
        }
      }
    })
  }



  buttons() {
    return (<div className="pure-button-group xlarge">
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, MAINNET)}>Ethereum Main Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, ROPSTEN)}>Ropsten Test Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, KOVAN)}>Kovan Test Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, LOCALRPC)}>Local RPC</button>
            </div>);
          }

  revealForm() {
    if (this.state.loadChild) {
      switch (this.state.childComponent){
        case TimestampMetaMask.name :
          return <TimestampMetaMask web3={this.state.web3}/>;
        case VerifyMetaMask.name:
          return <VerifyMetaMask web3={this.state.web3}/>;
        default:
          break;
      }

    } else {
      return this.buttons();
    }
  }

  currentNetwork(){
    if (this.state.selectedNetwork !== null){
      switch (this.state.selectedNetwork){
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

  render() {
    return (
      <div className="App">
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Document time-stamping on the Ethereum Blockchain</h1>
              <h2>Please choose the network to use</h2>
              {this.currentNetwork()}
            </div>
          </div>
        </main>
        <main className="container">
          {this.revealForm()}
        </main>
      </div>

    );
  }

}

export default MetaMaskApp