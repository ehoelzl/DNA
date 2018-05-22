import '../css/Pages.css'
import React, {Component} from 'react';
import {Table, Grid, Row} from 'react-bootstrap';
import {getStatusString, ContractNotFound, RequestStatus_String} from '../utils/HtmlElements';
import {privateKeyDecrypt, saveByteArray} from '../utils/UtilityFunctions';
import Patenting from '../../build/contracts/Patenting';
import wrapWithMetamask from '../MetaMaskWrapper'
import {NOT_REQUESTED, contractError} from "../utils/ErrorHandler";

import {generateKey} from '../utils/KeyGenerator';
import Bundle from '../utils/ipfsBundle';

class MyRequests_class extends Component{

  constructor(props){
    super(props);
    this.bundle = new Bundle();
    this.state = {
      web3 : props.web3,
      contractInstance : null,
      numRequests : 0,
      requests : []
    }
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
    }).catch(error => console.log('Error' + error)); //Todo : change this error handler
  }

  getMyRequests(numPatents){
    if (this.state.contractInstance !== null){
      let instance = this.state.contractInstance;
      for (let i=0; i < numPatents; i++){
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
          let requests = this.state.requests;
          requests.push(new_entry);
          this.setState({pendingRequests : requests, numRequests: this.state.numRequests + 1});
        }).catch(e => {
          if (e.message !== NOT_REQUESTED) { //Catch error if the patent is not authorized
            contractError(e)
          }
        })
      }
    }
  }

  downloadCopy(request){
    let privateKey;
    generateKey(this.state.web3, request.hash).then(pk => {
        privateKey = pk;
        return this.state.contractInstance.getEncryptedIpfsKey.call(request.name, {from: this.state.web3.coinbase})
      }).then(encryptedKey => {
        let key = privateKeyDecrypt(encryptedKey, privateKey);
        return this.bundle.getDecryptedFile(request.hash, request.ipfsLocation, key);
    }).then(buffer => saveByteArray(request.name, buffer, window, document))
  }

  /*Header for the Component, For the Metamask wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>My requests</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users to view the requests they have submitted and view documents they have access to. <br/>
            <br/>You only need to <b>unlock your Metamask extension</b>.
          </p>
        </Row>
      </Grid>

    );
  }

  /*Returns a table row for the given patent*/
  getRow(request) {
    return (
      <tr key={request.name} onClick={this.downloadCopy.bind(this, request)}>
        <td>{request.name}</td>
        <td>{request.hash}</td>
        <td>{request.status}</td>
      </tr>
    )
  }

  /*Returns a full table with patents*/
  renderTable() {
    if (this.state.numRequests !== 0) {
      let table = this.state.requests.map(request => this.getRow(request));
      let header = (
        <tr>
          <th>Patent Name</th>
          <th>Document Hash</th>
          <th>Request Status</th>
        </tr>
      );
      return (
        <Table striped hover responsive className='patent-table'>
          <thead>{header}</thead>
          <tbody>{table}</tbody>
        </Table>)
    } else {
      return <div className='not-found'><h3>You do not have any deposited requests on this network</h3></div>
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
            Patenting contract at {this.state.contractInstance.address} <br/>
            <br/> Current account {this.state.web3.eth.accounts[0]} (From Metamask)
          </Row>
          <Row>{this.renderTable()}</Row>
          {/*<Row>{this.state.displayDetails ? this.renderDetails() : this.renderTable()}</Row>*/}
        </Grid>)
    }
  }
}

const MyRequests = wrapWithMetamask(MyRequests_class, MyRequests_class.header());
export default MyRequests