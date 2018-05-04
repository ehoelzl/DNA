import React, {Component} from 'react';
import axios from 'axios'
import {Table} from 'react-bootstrap';
import {stampToDate, ContractNotFound} from '../utils/htmlElements';
import {toEther} from '../utils/stampUtil';
import Patenting from '../../build/contracts/Patenting';

import Constants from '../Constants'

/*const OPERATION = 'deposit';
const SERVER_ADDRESS = Constants.SERVER_IP + '/' + OPERATION;*/

class RentPatent extends Component {

  constructor(props){
    super(props);
    this.state = {
      web3 : props.web3,
      contractInstance : null,
      selectedPatent : "",
      numPatents : 0,
      patents : []
    };

    this.getPatents = this.getPatents.bind(this);
    //this.handleChange = this.handleChange.bind(this);
    //this.submitPatent = this.submitPatent.bind(this);
  }

  getPatents() {
    if (this.state.contractInstance !== null) {
      let instance = this.state.contractInstance;
      for (let i = 0; i < this.state.numPatents; i++){
        let new_entry = {};
        instance.patentNames.call(i).then(name => {
          new_entry['name'] = name;
          //this.setState({patents : patents})
          return instance.getPatentOwner.call(name);
        }).then(owner => {
          new_entry['owner'] = owner;
          return instance.getTimeStamp.call(new_entry['name'])
        }).then(timestamp => {
          new_entry['timestamp'] = timestamp.toNumber();
          return instance.getRentalPrice.call(new_entry['name'])
        }).then(price => {
          new_entry['price'] = price;
          let patents = this.state.patents;
          patents.push(new_entry);
          this.setState({patents : patents});
        })
      }
    }
  }


  componentWillMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentCount.call()
    }).then(count => {
      this.setState({numPatents : count.toNumber()});
      this.getPatents();
    }).catch(error => console.log('Error' + error));
  }

  static header(){
    return (
      <section className="header">
        <div className="title">
          Patent Rental
        </div>
        <p className="paragraph">This page allows users that have an Ethereum account and are using it on the Metamask
          extension for browsers, to rent access to Patents deposited by other users. <br/>

          <br/>You only need to unlock your Metamask extension and choose the document you want to access.
        </p>
      </section>
    );
  }

  getRow(patent){
    return (
      <tr key={patent.name}>
      <td>{patent.name}</td>
      <td>{patent.owner}</td>
      <td>{stampToDate(patent.timestamp)}</td>
      <td>{toEther(patent.price, this.state.web3)}</td>
      </tr>
    )
  }
  renderTable(){
    if (this.state.numPatents !== 0){
      let table = this.state.patents.map(patent => this.getRow(patent));
      let header = (
        <tr>
          <th>Patent Name</th>
          <th>Owner's address</th>
          <th>Submission Date</th>
          <th>Rental Price (ETH)</th>
        </tr>
      );
      return (
        <Table striped hover className='table-container' >
          <thead>{header}</thead>
          <tbody>{table}</tbody>
        </Table>)
    }
  }
  renderForm() {
    return (
      <div className="time-stamp-container">
        <div className='time-stamp-header'>Patenting contract at {this.state.contractInstance.address} <br/>
          <br/> Current account {this.state.web3.eth.accounts[0]} (From Metamask)</div>
        {this.renderTable()}
      </div>
    );
  }

  render(){
    if (this.state.contractInstance === null){
      return <ContractNotFound/>;
    } else {
      return this.renderForm()
    }
  }
}

export default RentPatent