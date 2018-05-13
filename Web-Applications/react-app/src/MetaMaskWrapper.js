import './css/Pages.css'

import React, {Component} from 'react';
import {ButtonGroup, Button} from 'react-bootstrap';
import getWeb3 from './utils/getWeb3'

import {METAMASK_NOTFOUND, INVALID_NETWORK, UNLOCK_METAMASK} from './utils/ErrorHandler'

const MAINNET = 1;
const ROPSTEN = 3;
const KOVAN = 4;
const LOCALRPC = 5777;

const MAINNET_STRING = "Ethereum Main Net";
const ROPSTEN_STRING = "Ropsten Test Net";
const KOVAN_STRING = "Kovan Test Net";
const LOCALRPC_STRING = "Local RPC";

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/* This function wraps The given component with a Metamask Component. This make code reusable
* The returned component communicates with the Web3 object injected by Metamask and handles the choice of Network
* This page requires a Web3 object injected into the web page
*
* The component passed to the constructor as a props is the Child component (TimestampMetamask, VerifyMetamask, DepositPatent or BuyPatent)
* */
function wrapWithMetamask(Wrapped, header) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        web3: null,
        selectedNetwork: null,
        loadChild: false,
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
        result.web3.eth.getAccounts((err, accounts) => {
          if (err || accounts.length === 0) {
            alert(UNLOCK_METAMASK)
          } else {
            this.setNetwork(networkId);
          }
        })

      }).catch(e => {
        alert(METAMASK_NOTFOUND);
      });
    }

    /*Verifies the if the chosen network corresponds to the one in metamask
    * */
    setNetwork(networkId) {
      this.state.web3.version.getNetwork((err, id) => {
        id = parseInt(id, 10);
        if (id !== networkId) {
          alert(INVALID_NETWORK);
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
          <Button onClick={this.getWeb3Object.bind(this, MAINNET)}
                  disabled={this.state.selectedNetwork === MAINNET}>{MAINNET_STRING}</Button>
          <Button onClick={this.getWeb3Object.bind(this, ROPSTEN)}
                  disabled={this.state.selectedNetwork === ROPSTEN}>{ROPSTEN_STRING}</Button>
          <Button onClick={this.getWeb3Object.bind(this, KOVAN)}
                  disabled={this.state.selectedNetwork === KOVAN}>{KOVAN_STRING}</Button>
          <Button onClick={this.getWeb3Object.bind(this, LOCALRPC)}
                  disabled={this.state.selectedNetwork === LOCALRPC}>{LOCALRPC_STRING}</Button>
        </ButtonGroup>
      );
    }

    /*
      * Conditional rendering for the child component (either timestamping or verifying the timestamp)
      * */
    renderChild() {
      let child = "";
      if (this.state.loadChild) {
        child = <Wrapped web3={this.state.web3}/>
      }
      return (
        <div className='metamask-container'>
          <div className='buttons-container'>
            {this.buttons()}
          </div>
          {child}
        </div>
      );
    }


    /*
    * Rendering for the page
    * */
    render() {
      return (
        <div className="app-container">
          {header}
          {this.renderChild()}
        </div>

      );
    }
  }
}


export default wrapWithMetamask