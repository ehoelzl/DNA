import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


import React, {Component} from 'react'

import MetaMaskApp from './MetaMaskApp/MetaMaskApp';
import VerifyMetaMask from "./MetaMaskApp/VerifyMetaMask";
import VerifyFree from "./FreeApp/VerifyFree";

const METAMASK = 1;
const SERVER = 2;

class VerifyTimestamp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedService : null,
      loadChild : false
    };

    this.resetState = this.resetState.bind(this);
  }

  resetState() {
    this.setState({
      selectedService : null,
      loadChild : false
    })
  }



  setService(service){
    if (service === METAMASK || service === SERVER){
      this.setState({selectedService : service, loadChild : true});
    }
  }


  buttons(){
    return (<div className="pure-button-group xlarge">
      <button className="pure-button" onClick={this.setService.bind(this, METAMASK)}>Metamask Client</button>
      <button className="pure-button" onClick={this.setService.bind(this, SERVER)}>Server</button>
    </div>);
  }

  renderChild(){
    if (this.state.loadChild){
      switch(this.state.selectedService){
        case METAMASK:
          return <MetaMaskApp component={VerifyMetaMask.name}/>;
        case SERVER:
          return <VerifyFree/>;
        default :
          return ;
      }
    }
  }

  render() {
    return (
      <div className="App">
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Document time-stamp verification on the Ethereum Blockchain</h1>
              <h2>Use this page to verify the signature of a document</h2>
              {this.buttons()}
            </div>
          </div>
        </main>
        <main className="container">
          {this.renderChild()}
        </main>
      </div>
    );
  }
}

export default VerifyTimestamp