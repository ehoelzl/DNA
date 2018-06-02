import './css/Pages.css'
import React, {Component} from 'react'
import {Grid, Row, Well} from 'react-bootstrap'

class Home extends Component {

  render() {
    return (
      <Well bsSize={"large"}>
        <Grid>
          <Row bsClass="page-title">Decentralized Notary Application</Row>
          <hr/>
          <Row bsClass="paragraph">
            Blockchains and other similar decentralized ledgers have recently emerged in force in the financial and
            economical market,
            and have introduced to the world a new way of decentralizing databases and distributing trust amongst the
            users.
            <br/>
            <br/>
            However, Blockchains do have other use cases that take advantage of the cryptographic security it provides,
            the integrity and the ability to function without a central authority.
            <br/>
            <br/>
            This Decentralized Notary Application makes use of the integrity and immutability of the data stored in
            Smart contracts of the
            <a href={"https://themerkle.com/what-is-the-ethereum-virtual-machine/"} className={"link"}> Ethereum Virtual
              Machine</a>
            , to provide Notarization of documents without the need of a central authority, and with absolute privacy.
            The second service allows users to store documents on the <a href={"https://ipfs.io"} className={"link"}>
            Interplanetary File System (IPFS)</a>, which is a peer-to-peer media transfer protocol, and use the Ethereum
            Blockchain
            to share research papers, confidential documents, media or any other digital document, to everyone for a set
            price.
            <br/>

            <br/>
            <br/>To understand more about the mechanism of our system, check the <a href="/About"
                                                                                    className="link">About</a> page !

            <br/>
            <br/>Cheers.
            <br/>
          </Row>
        </Grid></Well>
    )
  }
}

export default Home;
