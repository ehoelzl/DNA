import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

import React, {Component} from 'react'
import TimeStampForm from './TimeStampForm'
import VerifyTimeStamp from './VerifyTimeStamp'
import getWeb3 from '../utils/getWeb3'

const MAINNET = "1";
const ROPSTEN = "3";
const KOVAN = "4";
const LOCALRPC = "5777";


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
      if (id !== networkId.toString()) {
        alert("Please choose the network that corresponds to your current Metamask account");
        this.resetState();
      } else {
        switch (id) {
          case MAINNET:
            this.setState({selectedNetwork: "Main Net", loadChild: true});
            break;
          case ROPSTEN:
            this.setState({selectedNetwork: "Ropsten Test Net", loadChild: true});
            break;
          case KOVAN:
            this.setState({selectedNetwork: "Kovan Test Net", loadChild: true});
            break;
          case LOCALRPC:
            this.setState({selectedNetwork : "Local RPC", loadChild : true});
            break;
          default :
            this.setState({selectedNetwork: "Unknown Network", loadChild: false});
        }
      }
    })
  }



  buttons() {
    return (<div className="pure-button-group xlarge">
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, 1)}>Ethereum Main Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, 3)}>Ropsten Test Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, 4)}>Kovan Test Net</button>
              <button className="pure-button" onClick={this.getWeb3Object.bind(this, 5777)}>Local RPC</button>
            </div>);
          }

  revealForm() {
    if (this.state.loadChild) {
      switch (this.state.childComponent){
        case TimeStampForm.name :
          return <TimeStampForm web3={this.state.web3}/>;
        case VerifyTimeStamp.name:
          return <VerifyTimeStamp web3={this.state.web3}/>;
        default:
          break;
      }

    } else {
      return this.buttons();
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
              <h3>Current network {this.state.selectedNetwork}</h3>
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