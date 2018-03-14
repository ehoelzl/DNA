import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


class App extends Component {

  constructor(props){
    super(props);
    var abi = [

      {
        "constant":true,
        "inputs":[
          {
            "name":"",
            "type":"address"
          }
        ],
        "name":"funders",
        "outputs":[
          {
            "name":"",
            "type":"uint256"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
          {
            "name":"_addr",
            "type":"address"
          }
        ],
        "name":"getFunderContribution",
        "outputs":[
          {
            "name":"",
            "type":"uint256"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
        ],
        "name":"deadline",
        "outputs":[
          {
            "name":"",
            "type":"uint256"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
        ],
        "name":"beneficiary",
        "outputs":[
          {
            "name":"",
            "type":"address"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
        ],
        "name":"goal",
        "outputs":[
          {
            "name":"",
            "type":"uint256"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
          {
            "name":"_index",
            "type":"uint256"
          }
        ],
        "name":"funderAddress",
        "outputs":[
          {
            "name":"",
            "type":"address"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":false,
        "inputs":[
        ],
        "name":"refund",
        "outputs":[
        ],
        "payable":true,
        "stateMutability":"payable",
        "type":"function"
      },
      {
        "constant":false,
        "inputs":[
        ],
        "name":"payout",
        "outputs":[
        ],
        "payable":false,
        "stateMutability":"nonpayable",
        "type":"function"
      },
      {
        "constant":true,
        "inputs":[
        ],
        "name":"funderAddressLength",
        "outputs":[
          {
            "name":"",
            "type":"uint256"
          }
        ],
        "payable":false,
        "stateMutability":"view",
        "type":"function"
      },
      {
        "constant":false,
        "inputs":[
        ],
        "name":"contribute",
        "outputs":[
        ],
        "payable":true,
        "stateMutability":"payable",
        "type":"function"
      },
      {
        "inputs":[
          {
            "name":"_beneficiary",
            "type":"address"
          },
          {
            "name":"_goal",
            "type":"uint256"
          },
          {
            "name":"_duration",
            "type":"uint256"
          }
        ],
        "payable":true,
        "stateMutability":"payable",
        "type":"constructor"
      },
      {
        "anonymous":false,
        "inputs":[
          {
            "indexed":true,
            "name":"_from",
            "type":"address"
          },
          {
            "indexed":false,
            "name":"_value",
            "type":"uint256"
          }
        ],
        "name":"NewContribution",
        "type":"event"
      }

    ];

    var contract = window.web3.eth.contract(abi);
    this.instance = contract.at('0x43a07103053a75699792c4cc4a174565a6fc030b');

    this.state = {
      address: 0,
      authenticated : false,
      balance : 0,
      contribution : 0,
      contributed : 0
    };

  }



  authenticate() {
    var EthUtil = require('ethereumjs-util');
    var userEthereumClient = window.web3;
    var message = "DecypherTV";
    var messageHash = window.web3.sha3(message);
    var messageHashx = new Buffer(messageHash.substr(2), 'hex');
    //Sign the message using MetaMask
    userEthereumClient.eth.sign(userEthereumClient.eth.coinbase,messageHash,function (error, data){
      if (!error){
        var signedAuthMessage = data;
        document.cookie = "signedAuthMessage=" + signedAuthMessage;
        var sigDecoded = EthUtil.fromRpcSig(signedAuthMessage);
        var recoveredPub = EthUtil.ecrecover(messageHashx, sigDecoded.v, sigDecoded.r, sigDecoded.s);
        var recoveredAddress = EthUtil.pubToAddress(recoveredPub).toString('hex');
        if (userEthereumClient.eth.coinbase.substr(2) === recoveredAddress) {
          this.setState({address : userEthereumClient.eth.coinbase, authenticated : true});

          userEthereumClient.eth.getBalance(userEthereumClient.eth.coinbase, function (error, result) {
            this.setState({balance : window.web3.fromWei(result, 'ether').toNumber()})
          }.bind(this));

          //constant function
          this.instance.getFunderContribution(userEthereumClient.eth.coinbase, function(error, result)  {
            this.setState({contributed : userEthereumClient.fromWei(result).toNumber()})
          }.bind(this));
        }
      }

    }.bind(this));
    //console.log(signedAuthMessage);

  }


  reveal(){
    if (this.state.authenticated && this.state.address !== 0){
      window.web3.eth.getGasPrice(function(error, result) {
        if (!error){
          this.setState({gasPrice : result.toNumber()})
        }
      }.bind(this));
      return (<div className="Body">
        <h1>Welcome {this.state.address} </h1>
        <h1> You have {this.state.balance} Ether </h1>
        <h1> Gas price at {this.state.gasPrice} wei </h1>
        <h2> You have contributed {this.state.contributed} Ether !</h2>
      </div>);
    }

    return ;
  }


  payout() {
    this.instance.payout((error, result) => alert(result));
  }

  refund(){
    this.instance.refund((error, result) => alert(result));
  }

  contribute(event){
    var ev = this.instance.NewContribution({_from: window.web3.coinbase});
    ev.watch((error, result) => {
      alert("Contribution of :"+ window.web3.fromWei(result.args._value,'ether')+" ETH recieved");
      this.reveal();
    });
    this.instance.contribute({from : window.web3.eth.coinbase, value : window.web3.toWei(this.state.contribution, 'ether'), gas :1000000}, function (error, result) {
      if (error){
        alert("Contribution failed");
      } else {
        alert("Contribution Accepted : " + result);
      }
    });
    event.preventDefault();
  }
  handleChange(event){
    this.setState({contribution : event.target.value});
    console.log(this.state.contribution);
  }


  renderButtons(){
    return (<div>
              <button className="auth" onClick={() => this.authenticate()}>Authenticate</button>
              <button className="send" onClick={() => this.sendEther()}>Send Ether </button>
              {this.reveal()}
            </div>)
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Crowd Fund test contract at 0x43a07103053a75699792c4cc4a174565a6fc030b</h1>
        </header>
        <p className="App-intro">
          You need to authenticate
        </p>

        {this.renderButtons()}
        <br />
        <br />
        <form onSubmit={(event) => this.contribute(event)}>
          <label>
            Contribution Amount (Ether) :
            <input type="number" value={this.state.contribution} onChange={(event) => this.handleChange(event)}/>
          </label>
          <input type="submit" value="Contribute"/>
        </form>
        <br />

        <button onClick={() => this.refund()}>Refund</button>
        <button onClick={() => this.payout()}>Payout</button>
      </div>

    );
  }
}

export default App;