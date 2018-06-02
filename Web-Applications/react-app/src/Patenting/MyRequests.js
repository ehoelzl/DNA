import '../css/Pages.css'
import React, {Component} from 'react';
import {Grid, Row, PanelGroup} from 'react-bootstrap';
import {ContractNotFound} from '../utils/FunctionalComponents';
import {getStatusString} from '../Constants';
import {toEther} from '../utils/UtilityFunctions';
import Patenting from '../../build/contracts/Patenting';
import wrapWithMetamask from '../MetaMaskWrapper'
import {NOT_REQUESTED, contractError} from "../utils/ErrorHandler";

import Bundle from '../utils/ipfsBundle';

import RequestPanel from './RequestPanel';


/*Component for browsing submitted requests*/
class MyRequests_class extends Component {

  /*Constructor of the class*/
  constructor(props) {
    super(props);
    this.bundle = new Bundle();
    this.state = {
      web3: props.web3,
      contractInstance: null,
      numRequests: 0,
      activeKey: 1,
      requests: []
    };
    this.handleSelect = this.handleSelect.bind(this)
  }

  componentDidMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentCount.call()
    }).then(count => {
      this.getMyRequests(count.toNumber());
    }).catch(error => this.setState({contractInstance: null}));
  }

  /*Fetches the requests from the smart contract*/
  getMyRequests(numPatents) {
    if (this.state.contractInstance !== null) {
      let instance = this.state.contractInstance;
      for (let i = 0; i < numPatents; i++) {
        let patentName;
        let new_entry = {};
        instance.patentNames.call(i).then(name => {
          patentName = name;
          return instance.isNotRequested.call(patentName, this.state.web3.eth.coinbase)
        }).then(isNotRequested => {
          if (!isNotRequested) {
            return instance.getRequestStatus.call(patentName, this.state.web3.eth.coinbase)
          } else {
            throw Error(NOT_REQUESTED)
          }
        }).then(status => {
          new_entry['name'] = patentName;
          new_entry['status'] = getStatusString(status);
          return instance.getPatentHash.call(patentName);
        }).then(hash => {
          new_entry['hash'] = hash;
          return instance.getPatentLocation.call(patentName);
        }).then(loc => {
          new_entry['ipfsLocation'] = loc;
          return instance.getPrice.call(patentName)
        }).then(price => {
          new_entry['price'] = toEther(price, this.state.web3);
          return instance.getOwnerEmail.call(patentName);
        }).then(mail => {
          new_entry['ownerEmail'] = mail;
          new_entry['id'] = (this.state.numRequests + 1);
          let requests = this.state.requests;
          requests.push(new_entry);
          this.setState({pendingRequests: requests, numRequests: this.state.numRequests + 1});
        }).catch(e => {
          if (e.message !== NOT_REQUESTED) { //Catch error if the patent is not authorized
            contractError(e)
          }
        })
      }
    }
  }


  /*To change between requests*/
  handleSelect(activeKey) {
    this.setState({activeKey: activeKey})
  }

  /*Returns a full table with patents*/
  renderTable() {
    if (this.state.numRequests !== 0) {
      let panels = this.state.requests.map(request => {
        return <RequestPanel web3={this.state.web3} instance={this.state.contractInstance} bundle={this.bundle}
                             request={request} key={request.id}/>
      });
      return (
        <PanelGroup
          accordion activeKey={this.state.activeKey} onSelect={this.handleSelect} id="accordion-controlled"
          className="requests-container">
          {panels}
        </PanelGroup>)
    } else {
      return <div className='not-found'><h3>You do not have any requests on this network</h3></div>
    }
  }

  /*Header for the Component, For the Metamask wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>My requests</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users to view the requests they have submitted and view documents they have access
            to. <br/>
            <br/>You only need to <b>unlock your Metamask extension</b>.
          </p>
        </Row>
      </Grid>

    );
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
        </Grid>)
    }
  }
}

const MyRequests = wrapWithMetamask(MyRequests_class, MyRequests_class.header());
export default MyRequests