import './css/Home.css'
import React, {Component} from 'react'

class Home extends Component{

  render(){return (
    <section className="page-header">
      <h1 className="heading">Decentralized Notary Application
        <br/>
      </h1>
      <p className="paragraph">
        <i>
        </i>Blockchains is a very widespread topic as of today, with many new emerging applications that use this supposedly
        new technology because of the security and authenticity it provides.
        <br/>
        <br/>This Web application provides an easy way for any user to <a href='/AdditionalInfo' className="link">time-stamp</a> any
        document at all times, by relying on the security and immutability of the Ethereum Blockchain. The service
        we provide is absolutely confidential, as no information about the time-stamped documents is stored. In fact, we do
        not have any Database, and completely rely on the Blockchain's security.
        <br/>
        <br/>New features such as Distributed Intellectual Property will be added in the near future, providing an easy way
        for users to share research and academic papers.
        <br/>
        <br/>
        <br/>To understand more about the mechanism of our system, check the <a href="/About" className="link">About</a> page !

        <br/>
        <br/>Cheers.
        <br/>
      </p>
    </section>
  )
  }
}

export default Home;
