import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import React, {Component} from 'react'
import TimeStampForm from './TimeStampForm'
import VerifyTimeStamp from './VerifyTimeStamp'
import getWeb3 from './utils/getWeb3'

const MAINNET = "1";
const ROPSTEN = "3";
const KOVAN = "4";
const LOCALRPC = "5777";



class MetaMaskApp extends Component {


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

  resetState() {
    this.setState({
      web3: null,
      selectedNetwork: null,
      loadChild: false
    });
  }

  getWeb3Object(networkId) {
    getWeb3.then(result => {
      this.setState({web3: result.web3});
      this.setNetwork(networkId);
    }).catch(e => {
      alert('Web3 not found ');
    });
  }


  setNetwork(networkId) {
    this.state.web3.version.getNetwork((err, id) => {
      if (id !== networkId.toString()) {
        console.log(id);
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


  chooseNetwork(id) {
    this.getWeb3Object(id);
  }

  buttons() {
    return (<div className="pure-button-group xlarge">
              <button className="pure-button" onClick={this.chooseNetwork.bind(this, 1)}>Ethereum Main Net</button>
              <button className="pure-button" onClick={this.chooseNetwork.bind(this, 3)}>Ropsten Test Net</button>
              <button className="pure-button" onClick={this.chooseNetwork.bind(this, 4)}>Kovan Test Net</button>
              <button className="pure-button" onClick={this.chooseNetwork.bind(this, 5777)}>Local RPC</button>
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