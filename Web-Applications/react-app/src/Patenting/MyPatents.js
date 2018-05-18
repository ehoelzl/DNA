import '../css/Pages.css'
import React, {Component} from 'react';
import {Table, Grid, Row} from 'react-bootstrap';
import {stampToDate, ContractNotFound} from '../utils/HtmlElements';
import Patenting from '../../build/contracts/Patenting';
import wrapWithMetamask from '../MetaMaskWrapper';


//import ViewerPDF from '../utils/ViewerPDF';
import {contractError, NOT_AUTHORIZED} from '../utils/ErrorHandler'

class MyPatents_class extends Component {

  /*Constructor Method, initializes the State*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      numPatents: 0,
      patents: []
    };

    this.getMyPatents = this.getMyPatents.bind(this);
  }

  /*Method called before the component is mounted, initializes the contract and the page content*/
  componentWillMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentCount.call()
    }).then(count => {
      this.getMyPatents(count.toNumber());
    }).catch(error => console.log('Error' + error)); //Todo : change this error handler
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/


  /*Function that gets all authorized patent information form the contract and stores them in the state*/
  getMyPatents(numPatents) {
    if (this.state.contractInstance !== null) {
      let instance = this.state.contractInstance;
      for (let i = 0; i < numPatents; i++) {
        let patentName;
        let new_entry = {};
        instance.patentNames.call(i).then(name => {
          patentName = name;
          return instance.isAuthorized(patentName, this.state.web3.eth.coinbase)
        }).then(authorized => {
          if (authorized) {
            return instance.getTimeStamp.call(patentName)
          } else {
            throw Error(NOT_AUTHORIZED)
          }
        }).then(timestamp => {
          new_entry['name'] = patentName;
          new_entry['timestamp'] = timestamp.toNumber();
          return instance.getPatentOwner.call(new_entry['name'])
        }).then(owner => {
          new_entry['owner'] = owner === this.state.web3.eth.coinbase ? 'You' : owner;
          return this.state.contractInstance.getPatentLocation(patentName, {
            from: this.state.web3.eth.coinbase
          });
        }).then(loc => {
          new_entry['location'] = loc;
          let patents = this.state.patents;
          patents.push(new_entry);
          this.setState({patents: patents, numPatents: this.state.numPatents + 1});
        }).catch(e => {
          if (e.message !== NOT_AUTHORIZED) { //Catch error if the patent is not authorized
            contractError(e)
          }
        })
      }
    }
  }

  //TODO : CHange this to decrypt PDF
  getPdf(ipfsLocation) {
    window.open("https://ipfs.io/ipfs/" + ipfsLocation, "_blank");
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Header for the Component, For the Metamask wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>My patents</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users to view the Patents they have deposited, and the ones they have bought. <br/>
            To reveal a patent IPFS location, please click on the corresponding row and you will be redirected<br/>
            <br/>You only need to <b>unlock your Metamask extension</b> and choose the document you want to access.
          </p>
        </Row>
      </Grid>

    );
  }

  /*Returns a table row for the given patent*/
  getRow(patent) {
    return (
      // onClick={this.revealIpfsLocation.bind(this, patent)}
      <tr key={patent.name} onClick={this.getPdf.bind(this, patent.location)}>
        <td>{patent.name}</td>
        <td>{patent.owner}</td>
        <td>{stampToDate(patent.timestamp)}</td>
        {/*<td>{patent.location}</td>*/}
      </tr>
    )
  }

  /*Returns a full table with patents*/
  renderTable() {
    if (this.state.numPatents !== 0) {
      let table = this.state.patents.map(patent => this.getRow(patent));
      let header = (
        <tr>
          <th>Patent Name</th>
          <th>Owner's address</th>
          <th>Submission Date</th>
          {/*<th>Patent Location</th>*/}
        </tr>
      );
      return (
        <Table striped hover responsive className='patent-table'>
          <thead>{header}</thead>
          <tbody>{table}</tbody>
        </Table>)
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
        </Grid>)
    }
  }
}

const MyPatents = wrapWithMetamask(MyPatents_class, MyPatents_class.header());
export default MyPatents
