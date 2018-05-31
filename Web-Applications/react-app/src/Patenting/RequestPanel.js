import '../css/Pages.css'
import React, {Component} from 'react';
import {Button, ButtonGroup, Panel, Label} from 'react-bootstrap';
import {RequestStatus_String} from '../Constants';
import {saveByteArray, fromEther, successfullTx} from '../utils/UtilityFunctions';
import {privateKeyDecrypt} from '../utils/CryptoUtils'
import {contractError, KEY_GENERATION_ERROR, IPFS_ERROR, KEY_ERROR} from "../utils/ErrorHandler";

import {generatePrivateKey} from '../utils/KeyGenerator';

class RequestPanel extends Component {

  constructor(props) {
    super(props);
    this.bundle = props.bundle;
    this.state = {
      web3: props.web3,
      request: props.request,
      contractInstance: props.instance
    };

    this.downloadCopy = this.downloadCopy.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.resendRequest = this.resendRequest.bind(this);
  }

  downloadCopy() {
    let privateKey;
    let request = this.state.request;
    generatePrivateKey(this.state.web3, request.hash).then(pk => {
      privateKey = pk;
      return this.state.contractInstance.getEncryptedIpfsKey.call(request.name, {from: this.state.web3.eth.coinbase})
    }).then(encryptedKey => {
      let key = privateKeyDecrypt(encryptedKey, privateKey);
      alert("Download will start shortly");
      return this.bundle.getDecryptedFile(request.hash, request.ipfsLocation, key);
    }).then(buffer => saveByteArray(request.name, buffer, window, document))
      .catch(e => {
        if (e === KEY_GENERATION_ERROR || e === KEY_ERROR || e === IPFS_ERROR) {
          alert(e)
        } else {
          contractError(e)
        }
      })
  }

  cancelRequest() {
    let request = this.state.request;
    this.state.contractInstance.cancelRequest(request.name, {
      from: this.state.web3.eth.coinbase,
      gas: process.env.REACT_APP_GAS_LIMIT
    }).then(tx => {
      alert(successfullTx(tx));
      let req = this.state.request;
      req.status = RequestStatus_String.CANCELLED;
      this.setState({request: req});
    }).catch(e => contractError(e))
  }

  resendRequest() {
    let request = this.state.request;
    this.state.contractInstance.resendRequest(request.name, {
      from: this.state.web3.eth.coinbase,
      value: fromEther(request.price, this.state.web3),
      gas: process.env.REACT_APP_GAS_LIMIT
    }).then(tx => {
      alert(successfullTx(tx));
      let req = this.state.request;
      req.status = RequestStatus_String.PENDING;
      this.setState({request: req});
    }).catch(e => contractError(e))
  }

  getButton() {
    let button = "";
    switch (this.state.request.status) {
      case RequestStatus_String.ACCEPTED:
        button = <Button onClick={this.downloadCopy}> Download Copy</Button>;
        break;
      case RequestStatus_String.CANCELLED:
        button = <Button onClick={this.resendRequest}> Re-send Request ({this.state.request.price} ETH)</Button>;
        break;
      case RequestStatus_String.REJECTED:
        button = <Button onClick={this.resendRequest}> Re-send Request ({this.state.request.price} ETH)</Button>;
        break;
      case RequestStatus_String.PENDING:
        button = <Button onClick={this.cancelRequest}>Cancel and refund</Button>;
        break;
      default:
        break
    }
    return <ButtonGroup justified><ButtonGroup>{button}</ButtonGroup></ButtonGroup>
  }

  getLabel() {
    let labelStyle = "default";
    switch (this.state.request.status) {
      case RequestStatus_String.ACCEPTED:
        labelStyle = "success";
        break;
      case RequestStatus_String.CANCELLED:
        labelStyle = "warning";
        break;
      case RequestStatus_String.REJECTED:
        labelStyle = "danger";
        break;
      default:
        break;
    }
    return <Label bsStyle={labelStyle} className="pull-right">{this.state.request.status}</Label>
  }

  render() {
    return (
      <Panel eventKey={this.state.request.id} key={this.state.request.name}>
        <Panel.Heading><Panel.Title toggle>{this.state.request.name} {this.getLabel()}</Panel.Title></Panel.Heading>
        <Panel.Body collapsible>{this.getButton()}</Panel.Body>
      </Panel>);
  }
}

export default RequestPanel