import '../css/Pages.css'

import React, {Component} from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import {getFileHash} from '../utils/CryptoUtils';
import {FieldGroup, SubmitButton, ContractNotFound, StampContainer} from '../utils/FunctionalComponents';
import TimeStamping from '../../build/contracts/TimeStamping'
import {Constants} from '../Constants'
import {contractError, INVALID_FORM, LARGE_FILE} from '../utils/ErrorHandler'
import wrapWithMetamask from "../MetaMaskWrapper";

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/*Component for Timestamp and Signature Verification by directly communicating with the contract
* Uses the injected Web3 object to communicate with the contract
* */
class VerifyMetaMask_class extends Component {

  /*Constructor for the class*/
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      contractInstance: null,
      contractAddress: 0,
      hash: "",
      timestamp: 0,
      user: 0,
      displayResult: false,
      waitingTransaction: false
    };

    this.submitFile = this.submitFile.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  /*Override : Save the contract instance in the page state using the injected Web3 object (Metamask)
  * Saves the contract instance and its address
  * */
  componentDidMount() {
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance, contractAddress: instance.address});
    }).catch(error => this.setState({contractInstance: null, contractAddress: 0}))
  }

  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /*Helper method to reset the form*/
  resetForm() {
    this.setState({hash: "", timestamp: 0, user: 0, displayResult: false, waitingTransaction: false});
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/

  /*Handles the changes of the form fields */
  handleChange(e) {
    e.preventDefault();
    if (e.target.name === Constants.FILE) {
      let file = e.target.files[0];
      if (file.size < Constants.MAX_FILE_SIZE) {
        getFileHash(file, window).then(res => this.setState({hash: res})).catch(err => window.dialog.showAlert(err))
      } else {
        window.dialog.showAlert(LARGE_FILE)
      }
    }
  }

  /*Submits the file to the Contract to verify a timestamp and the address*/
  submitFile(e) {
    e.preventDefault();
    if (this.state.hash !== "") {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.getTimestamp.call(this.state.hash).then(res => {
        this.setState({timestamp: res.toNumber()});
        return this.state.contractInstance.getUser.call(this.state.hash);
      }).then(res => this.setState({user: res, displayResult: true, waitingTransaction: false}))
        .catch(error => {
          this.resetForm();
          contractError(error);
        });
    } else {
      this.resetForm();
      window.dialog.showAlert(INVALID_FORM);
    }
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*Form Rendering*/
  renderForm() {
    return (
      <form onSubmit={this.submitFile}>
        <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File" type="file" placeholder=""
                    help="File to verify"
                    onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingTransaction}/>
      </form>
    );
  }

  /*Component Rendering*/
  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return (
        <Grid>
          <Row bsClass="contract-address"><Col xsHidden>TimeStamping contract
            at {this.state.contractAddress}</Col></Row>
          <Row><Col sm={12} md={2} mdOffset={5}>
            {this.renderForm()}
          </Col></Row>
          <Row><Col sm={12} md={8} mdOffset={2}> {this.state.displayResult ?
            <StampContainer timestamp={this.state.timestamp} user={this.state.user}/> : ""}</Col></Row>
        </Grid>)
    }
  }
}

const VerifyMetaMask = wrapWithMetamask(VerifyMetaMask_class, "");
export default VerifyMetaMask
