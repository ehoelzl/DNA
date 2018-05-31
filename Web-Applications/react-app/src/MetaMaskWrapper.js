import './css/Pages.css'

import React, {Component} from 'react';
import {ButtonGroup, Button, Grid, Row, Col} from 'react-bootstrap';

import getWeb3 from './utils/getWeb3'
import {METAMASK_NOTFOUND, INVALID_NETWORK, UNLOCK_METAMASK} from './utils/ErrorHandler'

/*Constants for rendering and network selection*/

const Networks = {
  MAINNET: 1,
  ROPSTEN: 3,
  KOVAN: 42,
  LOCALRPC: 5777
};

const NetworkStrings = {
  MAINNET: "Ethereum Main Net",
  ROPSTEN: "Ropsten Test Net",
  KOVAN: "Kovan Test Net",
  LOCALRPC: "Local RPC"
};


/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/* This function wraps The given component with a Metamask Component. This make code reusable
* The returned component communicates with the Web3 object injected by Metamask and handles the choice of Network
* This page requires a Web3 object injected into the web page
*
* The component passed to the constructor as a props is the Child component (TimestampMetamask, VerifyMetamask, DepositPatent or RequestAccess)
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
            alert(UNLOCK_METAMASK);
            this.resetState();
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
            case Networks.MAINNET:
              this.setState({selectedNetwork: Networks.MAINNET, loadChild: true});
              break;
            case Networks.ROPSTEN:
              this.setState({selectedNetwork: Networks.ROPSTEN, loadChild: true});
              break;
            case Networks.KOVAN:
              this.setState({selectedNetwork: Networks.KOVAN, loadChild: true});
              break;
            case Networks.LOCALRPC:
              this.setState({selectedNetwork: Networks.LOCALRPC, loadChild: true});
              break;
            default :
              this.resetState();
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
        <ButtonGroup justified>
          <ButtonGroup bsSize="large">
            <Button onClick={this.getWeb3Object.bind(this, Networks.MAINNET)}
                    disabled={this.state.selectedNetwork === Networks.MAINNET}>{NetworkStrings.MAINNET}</Button>
          </ButtonGroup>
          <ButtonGroup bsSize="large">
            <Button onClick={this.getWeb3Object.bind(this, Networks.ROPSTEN)}
                    disabled={this.state.selectedNetwork === Networks.ROPSTEN}>{NetworkStrings.ROPSTEN}</Button>
          </ButtonGroup>
          <ButtonGroup bsSize="large">
            <Button onClick={this.getWeb3Object.bind(this, Networks.KOVAN)}
                    disabled={this.state.selectedNetwork === Networks.KOVAN}>{NetworkStrings.KOVAN}</Button>
          </ButtonGroup>
          <ButtonGroup bsSize="large">
            <Button onClick={this.getWeb3Object.bind(this, Networks.LOCALRPC)}
                    disabled={this.state.selectedNetwork === Networks.LOCALRPC}>{NetworkStrings.LOCALRPC}</Button>
          </ButtonGroup>
        </ButtonGroup>
      );
    }


    /*
    * Rendering for the page
    * */
    render() {
      return (
        <Grid>
          <Row>{header}</Row>
          <Row bsClass="buttons-container"><Col md={10} mdOffset={1}>{this.buttons()}</Col></Row>
          <Row>{this.state.loadChild ? <Wrapped web3={this.state.web3}/> : ""}</Row>
        </Grid>
      );
    }
  }
}


export default wrapWithMetamask