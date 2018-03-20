import React, { Component } from 'react'
import TimeStamping from '../build/contracts/TimeStamping.json'
import getWeb3 from './utils/getWeb3'
import sha256 from 'sha256'
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {


  constructor(props) {
    super(props);

    this.state = {
      address : 0,
      web3: null,
      timeStampInstance : null,
      hash : 0,
      price : 0,
      search_hash : 0,
      time_stamp : 0,
      user : 0,
      ether_price : 0,
      server_ip : "http://127.0.0.1:4000"
    };
    this.timeStampButton = this.timeStampButton.bind(this);
    this.submitHashChange = this.submitHashChange.bind(this);
    this.searchButton = this.searchButton.bind(this);
    this.searchHashChange = this.searchHashChange.bind(this);

  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      });
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }





  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      timeStamping.deployed().then((instance) => {
        this.setState({timeStampInstance : instance});
        this.setState({address : instance.address});
        return instance.price.call();
      }).then((price) => this.setState({price : price.toNumber(), ether_price : this.state.web3.fromWei(price.toNumber(), 'ether')}))
    });
  }

  submitHashChange(event){
    this.setState({hash : event.target.value});
  }

  searchHashChange(event){
    this.setState({search_hash :event.target.value})
  }

  timeStampButton(event){

    //No web3 connected, use the server to accumulate hashes
    if (this.state.web3 == null){
      alert("no web3");
      var axios = require('axios');
      axios.post(this.state.server_ip, this.state.hash);
    } else {
      this.state.timeStampInstance.stamp(sha256(this.state.hash), {from : this.state.web3.eth.coinbase, value : this.state.price})
        .then(rs => alert("Successful, tx :"+ rs.tx))
        .catch(error => alert("Could not time stamp the given hash"));
    }
  }



  searchButton(event) {
    this.state.timeStampInstance.getTimestamp.call(sha256(this.state.search_hash)).then(x => {
      if (x.toNumber() !== 0){
        this.setState({time_stamp : x.toNumber()})
      } else {
        alert("Hash not found");
      }
    }).catch(e => console.log(e));
    this.state.timeStampInstance.getUser.call(sha256(this.state.search_hash)).then(x => this.setState({user : x})).catch(e => console.log(e));
  }

  searchResults() {
    if (this.state.time_stamp !== 0){

      var date = new Date(this.state.time_stamp*1000);
      return (<p>Stamped on {date.toDateString()} at {date.toLocaleTimeString()} by user {this.state.user}</p>);

    } else {
      return ;
    }
  }
  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Timestamping at {this.state.address}</h1>
              <p>Smart contract ready for time stamping.</p>
              <h2>You can time stamp any string for now</h2>
              <p>Stamp price at {this.state.ether_price} ether</p>
            </div>
          </div>
          <div className="container">
            <label>Hash :
            <input type="text" name="hash" value={this.state.hash} onChange={this.submitHashChange}/></label>
            <button onClick={() => this.timeStampButton()}> Timestamp</button>
          </div>
          <div className="container">
            <label> Search for timestamp :
              <input type="text" name="hash" value={this.state.search_hash} onChange={this.searchHashChange}/></label>
            <button onClick={() => this.searchButton()}> Search </button>
          </div>

          <div className="container">
            {this.searchResults()}
          </div>
        </main>
      </div>
    );
  }
}

export default App
