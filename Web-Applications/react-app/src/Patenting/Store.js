import '../css/Pages.css'
import React, {Component} from 'react';
import {Table, Grid, Row} from 'react-bootstrap';
import {ContractNotFound} from '../utils/FunctionalComponents';
import {stampToDate, successfullTx} from '../utils/UtilityFunctions';
import {getStatusString} from '../Constants';
import Patenting from '../../build/contracts/Patenting';
import wrapWithMetamask from '../MetaMaskWrapper'

import Dialog from 'react-bootstrap-dialog'
import {generatePrivateKey, generatePublicKey} from '../utils/KeyGenerator'
import {ALREADY_REQUESTED, KEY_GENERATION_ERROR, contractError} from '../utils/ErrorHandler'

/*Component for requesting access to a patent*/
class Store_class extends Component {


  /*Constructor Method, initializes the State*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      selectedPatent: "",
      numPatents: 0,
      patents: [],
      gasPrice : 0
    };

    this.getPatents = this.getPatents.bind(this);
  }

  /*Method called before the component is mounted, initializes the contract and the page content*/
  componentDidMount() {
    this.state.web3.eth.getGasPrice((err, res) => this.setState({gasPrice : res.toNumber()}));
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentCount.call()
    }).then(count => {
      this.setState({numPatents: count.toNumber()});
      this.getPatents(count.toNumber());
    }).catch(error => this.setState({contractInstance: null}));
  }


  resetPatents() {
    setTimeout(() => {
      this.setState({patents: []});
      this.getPatents(this.state.numPatents)
    }, 3000)
  }

  /*Function that gets all patent information form the contract and stores them in the state*/
  getPatents(numPatents) {
    if (this.state.contractInstance !== null) {
      let instance = this.state.contractInstance;
      for (let i = 0; i < numPatents; i++) {
        let new_entry = {};
        instance.patentNames.call(i).then(name => {
          new_entry['name'] = name;
          return instance.getPatentOwner.call(name);
        }).then(owner => {
          new_entry['owner'] = owner;
          return instance.getTimeStamp.call(new_entry['name'])
        }).then(timestamp => {
          new_entry['timestamp'] = timestamp.toNumber();
          return instance.getPatentHash.call(new_entry['name']);
        }).then(hash => {
          new_entry['hash'] = hash;
          return instance.getRequestStatus.call(new_entry['name'], this.state.web3.eth.coinbase);
        }).then(status => {
          new_entry['status'] = getStatusString(status);
          return instance.getPrice.call(new_entry['name'])
        }).then(price => {
          new_entry['price'] = price.toNumber();
          return instance.getEthPrice(price);
        }).then(ethPrice => {
          new_entry['ethPrice'] = ethPrice;
          let patents = this.state.patents;
          patents.push(new_entry);
          this.setState({patents: patents});
        })
      }
    }
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  promptEmail(patent) {
    if (patent.owner !== this.state.web3.eth.coinbase) {
      this.state.contractInstance.canRequest.call(patent.name, this.state.web3.eth.coinbase).then(canRequest => {
        if (canRequest) {
          window.dialog.show({
            body: "Please provide us with your email so we can send you notifications regarding this request",
            bsSize: 'medium',
            prompt: Dialog.TextPrompt({placeholder: "your email"}),
            actions: [
              Dialog.CancelAction(),
              Dialog.OKAction(diag => this.requestAccess(patent, diag.value))
            ]
          })
        } else {
          window.dialog.showAlert(ALREADY_REQUESTED)
        }
      })
    } else {
      window.dialog.showAlert("You already own this file.");

    }
  }

  /*Function that initiates the contract call and creates a request*/
  requestAccess(patent, email) {
    if (email === undefined){
      window.dialog.showAlert("Your email is needed to receive notifications");
    } else if (email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) !== null){
      generatePrivateKey(this.state.web3, patent.hash).then(key => { //Generate privateKey = ECDSA(sha3(sha256(file))
        let publicKey = generatePublicKey(key); // Generate public key associated to this private key
        return this.state.contractInstance.requestAccess(patent.name, publicKey, email, { // New request = (account, publicKey, "")
          from: this.state.web3.eth.coinbase,
          value: patent.ethPrice,
          gas: process.env.REACT_APP_GAS_LIMIT,
          gasPrice : this.state.gasPrice
        });
      }).then(tx => {
        successfullTx(tx);
        this.resetPatents();
      }).catch(e => {
        if (e === KEY_GENERATION_ERROR){
          window.dialog.showAlert(KEY_GENERATION_ERROR)
        } else {
          contractError(e);
        }
      });
    } else {
      window.dialog.showAlert("Please enter a valid email address")
    }


  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Header for the Component, For the Metamask wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>Files Store</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users that have an Ethereum account and are using it on the Metamask
            extension for browsers, to request access to files deposited by other users. <br/>To request a certain file,
            simply click on the row.<br/><br/>
            The owner will have to accept your request for you to be able to decrypt the document.
            <br/>You only need to <b>unlock your Metamask extension</b> and choose the document you want to access.
          </p>
        </Row>
      </Grid>
    );
  }

  /*Returns a table row for the given patent*/
  getRow(patent) {
    return (
      <tr key={patent.name} onClick={this.promptEmail.bind(this, patent)}>
        <td>{patent.name}</td>
        <td>{patent.owner === this.state.web3.eth.coinbase ? 'You' : patent.owner}</td>
        <td>{stampToDate(patent.timestamp)}</td>
        <td>{patent.price}</td>
        <td>{patent.status}</td>
      </tr>
    )
  }

  /*Returns a full table with patents*/
  renderTable() {
    if (this.state.numPatents !== 0) {
      let table = this.state.patents.map(patent => this.getRow(patent));
      let header = (
        <tr>
          <th>File Name</th>
          <th>Owner's address</th>
          <th>Submission Date</th>
          <th>Price (USD)</th>
          <th>Request Status</th>
        </tr>
      );
      return (
        <Table striped hover responsive className='patent-table'>
          <thead>{header}</thead>
          <tbody>{table}</tbody>
        </Table>)
    } else {
      return <div className='not-found'><h3>There are no deposited files on this Network</h3></div>
    }
  }

  /*Rendering function of the component*/
  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return (
        <Grid>
          <Row bsClass='contract-address'>
            Contract at {this.state.contractInstance.address} <br/>
            <br/> Current account {this.state.web3.eth.accounts[0]} (From Metamask)
          </Row>
          <Row>{this.renderTable()}</Row>
        </Grid>);
    }
  }
}

const Store = wrapWithMetamask(Store_class, Store_class.header());
export default Store
