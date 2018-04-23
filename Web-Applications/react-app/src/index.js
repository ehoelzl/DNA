import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import './css/Home.css'

import NavigationBar from './NavigationBar'
import MetaMaskApp from './MetaMaskApp';
import Home from './Home';
import TimestampMetaMask from "./Timestamp/TimestampMetaMask";
import TimestampFree from './Timestamp/TimestampFree';
import VerifyTimestamp from './VerifyTimestamp/VerifyTimestamp'

ReactDOM.render(
  <BrowserRouter>
    <div>
      <NavigationBar/>
      <switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Timestamp' component={TimestampFree}/>
        <Route exact path='/PersonalTimestamp' render={(props) => (<MetaMaskApp component={TimestampMetaMask.name}/>)}/>
        {/*<Route exact path='/VerifyTimestamp' render={(props) => (<MetaMaskApp component={VerifyTimeStamp.name}/>)}/>*/}
        <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>

      </switch>
    </div>
  </BrowserRouter>,

  document.getElementById('root')
);

