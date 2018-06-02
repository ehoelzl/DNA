import '../css/Pages.css'
import React, {Component} from 'react';
import {Table, Grid, Row, Button, ButtonGroup, Glyphicon} from 'react-bootstrap';
import {ContractNotFound} from '../utils/FunctionalComponents';
import {stampToDate} from '../utils/UtilityFunctions';
import Patenting from '../../build/contracts/Patenting';
import wrapWithMetamask from '../MetaMaskWrapper';

import FileManager from './FileManager'

import {contractError, NOT_OWNER} from '../utils/ErrorHandler'


/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/*Component to view User's deposited patents*/
class MyFiles_class extends Component {

  /*Constructor Method, initializes the State*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      numPatents: 0,
      patents: [],
      displayDetails: false,
      selectedPatent: null,
    };

    this.getMyPatents = this.getMyPatents.bind(this);
    this.nextPatent = this.nextPatent.bind(this);
    this.prevPatent = this.prevPatent.bind(this);
  }

  /*Method called before the component is mounted, initializes the contract and the page content*/
  componentDidMount() {
    const contract = require('truffle-contract');
    const patenting = contract(Patenting);
    patenting.setProvider(this.state.web3.currentProvider);
    patenting.deployed().then(instance => {
      this.setState({contractInstance: instance});
      return instance.patentCount.call()
    }).then(count => {
      this.getMyPatents(count.toNumber());
    }).catch(error => this.setState({contractInstance: null}));
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/


  /*Function that gets all owned patent information form the contract and stores them in the state*/
  getMyPatents(numPatents) {
    if (this.state.contractInstance !== null) {
      let instance = this.state.contractInstance;
      for (let i = 0; i < numPatents; i++) {
        let patentName;
        let new_entry = {};
        instance.patentNames.call(i).then(name => {
          patentName = name;
          return instance.isOwner.call(patentName, this.state.web3.eth.coinbase)
        }).then(isOwner => {
          if (isOwner) {
            return instance.getTimeStamp.call(patentName)
          } else {
            throw Error(NOT_OWNER)
          }
        }).then(timestamp => {
          new_entry['name'] = patentName;
          new_entry['timestamp'] = timestamp.toNumber();
          return instance.getNumRequests.call(patentName);
        }).then(num => {
          new_entry['numRequests'] = num.toNumber();
          return instance.getPatentHash.call(patentName);
        }).then(hash => {
          new_entry['hash'] = hash;
          return instance.getPatentLocation.call(patentName);
        }).then(loc => {
          new_entry['ipfsLocation'] = loc;
          new_entry['index'] = this.state.numPatents;
          let patents = this.state.patents;
          patents.push(new_entry);
          this.setState({patents: patents, numPatents: this.state.numPatents + 1});
        }).catch(e => {
          if (e.message !== NOT_OWNER) { //Catch error if the patent is not authorized
            contractError(e)
          }
        })
      }
    }
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/

  /*Displays the details of a given patent*/
  openDetails(patent) {
    this.setState({displayDetails: true, selectedPatent: patent});
  }

  /*Buttons to scroll through documents*/
  nextPatent() {
    if (this.state.displayDetails && this.state.selectedPatent !== null && this.state.selectedPatent.index < this.state.numPatents - 1) {
      this.setState({selectedPatent: this.state.patents[this.state.selectedPatent.index + 1]})
    }
  }

  prevPatent() {
    if (this.state.displayDetails && this.state.selectedPatent !== null && this.state.selectedPatent.index > 0) {
      this.setState({selectedPatent: this.state.patents[this.state.selectedPatent.index - 1]})
    }
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Button toolbar to scroll through documents*/
  buttonToolbar() {
    return (
      <ButtonGroup justified>
        <ButtonGroup>
          <Button onClick={() => this.setState({displayDetails: false, selectedPatent: null})}> <Glyphicon
            glyph="triangle-top"/>Hide Details</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={this.prevPatent}> <Glyphicon glyph="menu-left"/>Prev File</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={this.nextPatent}><Glyphicon glyph="menu-right"/>Next File</Button>
        </ButtonGroup>
      </ButtonGroup>);
  }


  /*Renders the details of a selected patent*/
  renderDetails() {
    return (

        <div className="requests-container">
          {this.buttonToolbar()}
          <FileManager web3={this.state.web3} contractInstance={this.state.contractInstance}
                       patent={this.state.selectedPatent}/>
        </div>
    )
  }

  /*Header for the Component, For the Metamask wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass='title'>My Files</Row>
        <Row bsClass='paragraph'>
          <p>This page allows users to view the Documents they have deposited, and manage the requests. <br/>
            To see the details, just click on the row.<br/>
            <br/>You only need to <b>unlock your Metamask extension</b>.
          </p>
        </Row>
      </Grid>

    );
  }

  /*Returns a table row for the given patent*/
  getRow(patent) {
    return (
      <tr key={patent.name} onClick={this.openDetails.bind(this, patent)}>
        <td>{patent.name}</td>
        <td>{stampToDate(patent.timestamp)}</td>
        <td>{patent.hash}</td>
        <td>{patent.numRequests}</td>
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
          <th>Submission Date</th>
          <th>Document Hash</th>
          <th>Number of requests</th>
        </tr>
      );
      return (
        <Table striped hover responsive className='patent-table'>
          <thead>{header}</thead>
          <tbody>{table}</tbody>
        </Table>)
    } else {
      return <div className='not-found'><h3>You do not have any deposited files on this network</h3></div>
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
          <Row>{this.state.displayDetails ? this.renderDetails() : this.renderTable()}</Row>
        </Grid>)
    }
  }
}

const MyFiles = wrapWithMetamask(MyFiles_class, MyFiles_class.header());
export default MyFiles
