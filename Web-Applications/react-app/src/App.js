import React, {Component} from 'react'
import {Route} from 'react-router-dom'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import NavigationBar from './NavigationBar'
import MetaMaskApp from './MetaMaskApp';

import TimestampMetaMask from "./Timestamp/TimestampMetaMask";
import TimestampFree from './Timestamp/TimestampFree';
import VerifyTimestamp from './VerifyTimestamp/VerifyTimestamp'

/*
* Main Web App component
*
* Takes care of routing within the web app
* */
class Router extends Component {

  render() {
    return (
      <div>
        <NavigationBar/>
        <switch>
          <main className='App'>
            {/*<Route exact path='/' component={Home}/>*/}
            <Route exact path='/Timestamp' component={TimestampFree}/>
            <Route exact path='/PersonalTimestamp' render={(props) => (<MetaMaskApp component={TimestampMetaMask.name}/>)}/>
            {/*<Route exact path='/VerifyTimestamp' render={(props) => (<MetaMaskApp component={VerifyTimeStamp.name}/>)}/>*/}
            <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>
          </main>

        </switch>
      </div>
    );
  }

}

export default Router