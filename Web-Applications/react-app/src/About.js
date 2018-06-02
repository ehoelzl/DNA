import React, {Component} from 'react';
import {Grid, Row, Glyphicon, PageHeader} from 'react-bootstrap';

class About extends Component {
  render() {
    return (
      <Grid>
        <Row><PageHeader><Glyphicon glyph={"info-sign"}/> About DNA <br/><br/>
          <small>Developed by Edoardo Hölzl and Axel Vandebrouck</small>
        </PageHeader></Row>
        <Row>
          <ul>
            <p style={{fontSize: '18px'}}>Ethereum Smart Contracts</p>
            One of the best things about Blockchain technology is the ability to automate code execution without the
            need of a central authority.
            Smart contracts represent chunks of code that have been deployed onto the Blockchain and that are immutable
            in the sense of their logic.
            A smart contract will typically implement the rules, penalties and actions to be executed, very much like a
            Paper Contract, but will
            automatically enforce compliance to these rules which cannot be altered by an external entity. Having said
            that, it is clear now why
            Smart Contracts are mostly used to implement monetary exchanges under some rules.
          </ul>
          <br/>
        </Row>
        <Row>
          <ul>
            <p style={{fontSize: '18px'}}>Metamask Extension</p>
            <a href={'https://metamask.io/'}>Metamask</a> is a browser extension, compatible with multiple browsers,
            that allows users to communicate
            with the Ethereum Blockchain and manage multiple accounts. Metamask is thus used to identify users and
            needed to interact with
            Decentralized Applications (Collection of Smart Contracts) like this one.
          </ul>
          <br/>
        </Row>
        <Row>
          <ul>
            <p style={{fontSize: '18px'}}>Use cases</p>
            <ul>
              <li>
                Time-stamping : Ability to prove a certain document was present in a given format at a certain time, and
                prove who it was time-stamped by
              </li>
              <li>
                File Sharing : Ability to share/sell/buy/store documents in an encrypted and secure way without the need
                of a central or third party authority
              </li>
            </ul>
          </ul>
          <br/>
        </Row>
        <Row>
          <ul>
            <p style={{fontSize: '18px'}}>Time-Stamping Service</p>
            Time-stamping is available in two formats : Free (for users that do not have an address) and Paid (for users
            that do).
            The difference between the free and the paid version is accuracy and digital signatures : the free service
            waits until multiple
            requests have been sent and will time-stamp them all at once by generating a Merkle Tree
            of <b>hashes</b> and only storing the root hash.
            The free service has an accuracy of 10 to 30 minutes and will only be able to <b>Verify</b> a document if
            the generated signature matches.
            However, the paid service will create an individual time-stamp for the document and will also include a
            signature of the document with the
            user's private Key. So to verify the date a document was submitted, one will only need to upload the
            document itself.
          </ul>
          <br/>
        </Row>
        <Row>
          <ul>
            <p style={{fontSize: '18px'}}>File Sharing service</p>
            This service works with a combination of the Ethereum Blockchain and the peer-to-peer File System called <a
            href="https://ipfs.io">IPFS</a>.
            We have decided to combine these two because IPFS provides a distributed File System where files can be
            stored and retrieved easily, and
            Smart Contracts provide a way to verify access rights and validate transactions without the need of a
            central authority.<br/>
            This combination gave birth to an easy to use system where users can store files encrypted with AES-256 bit
            on IPFS, and sell rights to these
            files to other users via the Ethereum Blockchain. Users can request access to documents, and the price of
            the file will be held by the Smart contract
            until one of the parties either Accepts the request or terminates it by Cancelling or Rejecting. The logic
            of the contract will determine who is to get
            the deposited amount.
          </ul>
          <br/>
        </Row>
        <Row>
          <ul>
            <p style={{fontSize : '18px'}}>What is IPFS ?</p>
            InterPlanetary File System is a peer-to-peer protocol / network, where files are content-addressable, meaning their contents determine their
            address. It connects computing devices and allows them to share files based on a file identifier, very much like HTTP, but based on their hash
            instead of a name, and offers a higher throughput due its distributed architecture and its use if the BitTorrent protocol.
            We have chosen to use this new Technology as it provides a very easy to use file Sharing system. The only thing it does not provide is
            encryption of the files themselves and access control, which we have added.
          </ul>
          <br/>
        </Row>
        <Row>
          <ul style={{paddingBottom : '100px'}}>
            <p style={{fontSize : '18px'}}>What encryption algorithms are used ?</p>
            The application uses a couple of cryptographic functions used to hash, sign or enrypt data.<br/>
            For time-stamping we use SHA-256 hashing algorithm, which translates any file into a 64 Hexadecimal character string, called a hash or fingerprint.
            Until this day, there isn't any known way to retrace the content that generated a certain hash, and it is theoretically impossible to have two different documents giving the same hash.<br/>
            For file sharing, we have used AES-256 bits to encrypt the documents on the IPFS network, which is a symmetric key encryption algorithm, meaning the same key is used to encrypt or decrypt the contents.
            The AES-256 key is generated by asking the file owner to sign the SHA-256 hash of the document using Elliptic Curve Digital Signature Algothimg (ECDSA). Such a key is not reproducible
            by anyone unless they have access to the user's private key. <br/>
            Key sharing uses Asymmetric key cryptography, where keys come in pairs (private and public) : The private key is generated by the requester's signature of the hash of the file
            (using ECDSA) and the public key associated to this private key is then put inside the request. The file owner can then accept the request and encrypt his AES-256 Key with the requester's
            public key, so that no one but the requester will be able to decrypt it. We have also used Elliptic Curve Integrated Encryption Scheme for this encryption.
          </ul>
          <br/>
        </Row>
      </Grid>
    )
  }
}

export default About