import '../css/Pages.css'
import React, {Component} from 'react';
import {ListGroup, ListGroupItem, Button, ButtonGroup, Panel, Row, Col} from 'react-bootstrap';

import {generatePrivateKey} from '../utils/KeyGenerator'
import {NOT_PENDING, KEY_GENERATION_ERROR, KEY_ERROR, IPFS_ERROR, ENCRYPTION_ERROR, contractError} from '../utils/ErrorHandler'
import {saveByteArray, successfullTx} from '../utils/UtilityFunctions'
import {publicKeyEncrypt} from '../utils/CryptoUtils'
import Bundle from '../utils/ipfsBundle'


/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/


/*Component to manage the pendingRequests of a given patent*/
class FileManager extends Component {

  /*Constructor with IPFS bundle*/
  constructor(props) {
    super(props);
    this.bundle = new Bundle();
    this.state = {
      contractInstance: props.contractInstance,
      web3: props.web3,
      patent: props.patent,
      pendingRequests: [],
      gasPrice : props.gasPrice
    };

    this.downloadCopy = this.downloadCopy.bind(this);
  }

  /*Called whenever new props are passed or props are updated*/
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.patent.name !== prevState.patent.name) {
      return ({
        contractInstance: prevState.contractInstance,
        web3: prevState.web3,
        patent: nextProps.patent,
        pendingRequests: []
      });

    }
    return null
  }

  /*Called before the component is mounted*/
  componentDidMount() {
    this.fetchRequests(this.state.patent);
  }

  /*Called after the state is changed to update the pendingRequests when a new props is passed*/
  componentDidUpdate(prevProps, prevState) {
    if (this.state.pendingRequests.length === 0) {
      this.fetchRequests(this.state.patent);
    }
  }

  /*Fetches the pending pendingRequests for the given patent*/
  fetchRequests(patent) {
    let numReq = patent.numRequests;
    for (let i = 0; i < numReq; i++) {
      let user;
      this.state.contractInstance.getBuyers.call(patent.name, i).then(_user => {
        user = _user;
        return this.state.contractInstance.isPending.call(patent.name, user)
      }).then(isPending => {
        if (isPending) {
          return this.state.contractInstance.getEncryptionKey(patent.name, user, {from: this.state.web3.eth.coinbase})
        } else {
          throw Error(NOT_PENDING);
        }
      }).then(key => {
        let requests = this.state.pendingRequests;
        requests.push({'account': user, 'key': key});
        this.setState({pendingRequests: requests});
      }).catch(e => {
        if (e.message !== NOT_PENDING) {
          contractError(e);
        }
      })
    }
  }

  /*--------------------------------- EVENT HANDLERS ---------------------------------*/

  /*Handler for accepting a given request : takes care of encrypting the key and communicating with the smart contract*/
  acceptRequest(request) {
    generatePrivateKey(this.state.web3, this.state.patent.hash).then(key => {
      return publicKeyEncrypt(key, request.key);
    }).then(encrypted => {
      return this.state.contractInstance.grantAccess(this.state.patent.name, request.account, encrypted, {
        from: this.state.web3.eth.coinbase,
        gas: process.env.REACT_APP_GAS_LIMIT,
        gasPrice : this.state.gasPrice
      });
    }).then(tx => {
      setTimeout(() => this.setState({pendingRequests: []}), 4000);
      successfullTx(tx);
    }).catch(e => {
      if (e === KEY_GENERATION_ERROR || e === ENCRYPTION_ERROR) {
        window.dialog.showAlert(e)
      } else {
        contractError(e)
      }
    })
  }

  /*Handler for rejecting a given request */
  rejectRequest(request) {
    this.state.contractInstance.rejectAccess(this.state.patent.name, request.account, {
      from: this.state.web3.eth.coinbase,
      gas: process.env.REACT_APP_GAS_LIMIT,
      gasPrice : this.state.gasPrice
    }).then(tx => {
      setTimeout(() => this.setState({pendingRequests: []}), 4000);
      successfullTx(tx)
    }).catch(e => {
      contractError(e)
    })
  }

  /*Decrypts and downloads the file from IPFS the document*/
  downloadCopy() {
    generatePrivateKey(this.state.web3, this.state.patent.hash).then(key => {
      let hash = this.state.patent.hash;
      let ipfsLoc = this.state.patent.ipfsLocation;
      window.dialog.showAlert("Download will start shortly");
      return this.bundle.getDecryptedFile(hash, ipfsLoc, key)
    }).then(bytes => {
      saveByteArray(this.state.patent.name, bytes, window, document)
    }).catch(e => {
      if (e === KEY_GENERATION_ERROR || e === KEY_ERROR || e === IPFS_ERROR) {
        window.dialog.showAlert(e)
      } else {
        contractError(e)
      }
    })
  }

  /*--------------------------------- USER INTERFACE COMPONENTS ---------------------------------*/


  /*Render pending requests as ListGroup*/
  renderRequests() {
    let elements = [];
    for (let i = 0; i < this.state.pendingRequests.length; i++) {
      let req = this.state.pendingRequests[i];
      let item =
        <ListGroupItem key={req.account}>
          <Row>
            <Col md={6}>{req.account}</Col>
            <Col md={6}>
              <ButtonGroup className="pull-right">
                <Button onClick={this.acceptRequest.bind(this, req)}>Accept</Button>
                <Button onClick={this.rejectRequest.bind(this, req)} bsStyle="danger">Reject</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </ListGroupItem>;

      elements.push(item)
    }

    return elements
  }

  render() {
    return (
      <Panel className="request-list">
        <Panel.Heading><Panel.Title className="request-title">{this.state.patent.name}</Panel.Title></Panel.Heading>
        <Panel.Body>{this.state.pendingRequests.length} Pending
          request{this.state.pendingRequests.length === 1 ? '' : 's'}</Panel.Body>
        <ListGroup>
          <ListGroupItem className="download-label" onClick={this.downloadCopy}>Download a copy</ListGroupItem>
          {this.renderRequests()}
        </ListGroup>
      </Panel>
    )
  }
}

export default FileManager