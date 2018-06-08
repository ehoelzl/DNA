import '../css/Pages.css'

import React, {Component} from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import TimeStamping from '../../build/contracts/TimeStamping'
import {successfullTx} from '../utils/UtilityFunctions';
import {getFileHash} from '../utils/CryptoUtils'
import {FieldGroup, SubmitButton, ContractNotFound} from '../utils/FunctionalComponents';
import {Constants} from '../Constants'
import {INVALID_FORM, LARGE_FILE, contractError} from '../utils/ErrorHandler'
import wrapWithMetamask from "../MetaMaskWrapper";


/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/

/*Component that handles the submission of a Timestamp by directly communicating with the contract itself
* Requires a Web3 object to be passed in as a Props
*
* Page at "/PersonalTimestamp"
* */
class TimestampMetaMask_class extends Component {

  /* Constructor for the Timestamping form
  * */
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      waitingTransaction: false,
      contractInstance: null,
      contractAddress: 0,
      stampPrice: 0,
      etherPrice : 0,
      gasPrice : 0,
      hash: ""
    };

    //Bindings for helper methods
    this.submitTimestamp = this.submitTimestamp.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }


  /*Override : Save the contract instance in the page state using the injected Web3 object (Metamask)
  * Saves the contract instance, its address and the Stamp price in Ether
  * */
  componentDidMount() {
    this.state.web3.eth.getGasPrice((err, res) => this.setState({gasPrice : res.toNumber()}));
    const contract = require('truffle-contract');
    const timeStamping = contract(TimeStamping);
    timeStamping.setProvider(this.state.web3.currentProvider);
    timeStamping.deployed().then(instance => {
      this.setState({contractInstance: instance, contractAddress: instance.address});
      return instance.price.call()
    }).then(price => {
      this.setState({stampPrice: price.toNumber()});
      return this.state.contractInstance.getEthPrice.call()
    }).then(ethPrice => this.setState({etherPrice : ethPrice}))
      .catch(error => this.setState({contractInstance: null, contractAddress: 0}));
  }


  /*--------------------------------- HELPER METHODS AND VALIDATION ---------------------------------*/

  /* Helper method that resets the form fields
  */
  resetForm() {
    this.setState({hash: "", waitingTransaction: false});
  }


  /* Helper method specific to this form
  * Returns true if the client is not waiting for another transactions and if the form fields are correctly set
  * */
  validateForm() {
    return (!(this.state.waitingTransaction || this.state.hash === ""));
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/


  /* Method is called when the submit button is pressed.
  * It expects to find all the form fields in the page state and executes the transaction via the Metamask client
  * Alerts the user in case the process did not complete and resets the form fields
  * */
  submitTimestamp(e) {
    e.preventDefault();
    if (this.validateForm()) {
      this.setState({waitingTransaction: true});
      this.state.contractInstance.stamp(this.state.hash, {
        from: this.state.web3.eth.coinbase,
        value: this.state.etherPrice,
        gas: process.env.REACT_APP_GAS_LIMIT,
        gasPrice : this.state.gasPrice
      }).then(tx => {
        this.resetForm();
        successfullTx(tx);
      }).catch(err => {
        this.resetForm();
        contractError(err);
      });
    } else {
      this.resetForm();
      window.dialog.showAlert(INVALID_FORM);
    }
  }

  /*
  * Method that sets the state whenever a form field is changed
  * Uses getFileHash method from the utils to get the hash of the uploaded file.
  * The hash of the file only is stored
  * */
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


  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/

  /*
  * Form component
  * */
  renderForm() {
    return (
      <form onSubmit={this.submitTimestamp}>
        <FieldGroup name={Constants.FILE} id="formsControlsFile" label="File"
                    type="file" placeholder=""
                    help="File you wish to timestamp"
                    onChange={this.handleChange}/>
        <SubmitButton running={this.state.waitingTransaction}/></form>
    );
  }

  /*Header for Metamask Wrapper*/
  static header() {
    return (
      <Grid>
        <Row bsClass="title">Document time-stamping</Row>
        <Row bsClass="paragraph"><p>This page allows users that have an Ethereum account and are using it on the
          Metamask
          extension for browsers,
          to time-stamp and sign documents with their address. Time-stamping is much more accurate and faster using
          this
          service.
          <br/><br/>You only need to <b>unlock your Metamask extension</b> and choose the document.
          <br/>Note that we do not store any data regarding the documents you upload; Only the hashes are retrieved.
        </p></Row>
      </Grid>
    );
  }

  render() {
    if (this.state.contractInstance === null) {
      return <ContractNotFound/>;
    } else {
      return (
        <Grid>
          <Row bsClass="contract-address"><Col xsHidden>TimeStamping contract at {this.state.contractAddress}
            <br/> Stamp price
            at {this.state.stampPrice} USD <br/> Using address {this.state.web3.eth.coinbase}</Col></Row>
          <Row><Col sm={12} md={2} mdOffset={5}>
            {this.renderForm()}
          </Col></Row>
        </Grid>);
    }
  }
}

const TimestampMetaMask = wrapWithMetamask(TimestampMetaMask_class, TimestampMetaMask_class.header());
export default TimestampMetaMask;