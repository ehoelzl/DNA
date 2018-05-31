import React, {Component} from 'react'
import {Grid, Row} from 'react-bootstrap'

class Home extends Component {

  render() {
    return (
      <Grid className="article">
        <Row bsClass="page-title">Decentralized Notary Application</Row>
        <Row bsClass="paragraph"><p>
          Blockchains is a very widespread topic as of today, with many new emerging applications that use this supposedly
          new technology because of the security and authenticity it provides.
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>To understand more about the mechanism of our system, check the <a href="/About"
                                                                                  className="link">About</a> page !

          <br/>
          <br/>Cheers.
          <br/></p></Row>
      </Grid>
    )
  }
}

export default Home;
