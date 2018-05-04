import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, browserHistory} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import './css/Home.css'

import NavigationBar from './NavigationBar'
import MetaMaskApp from './MetaMaskApp';
import Home from './Home';
import TimestampMetaMask from "./Timestamp/TimestampMetaMask";
import TimestampFree from './Timestamp/TimestampFree';
import VerifyTimestamp from './VerifyTimestamp/VerifyTimestamp';
import DepositPatent from './Patenting/DepositPatent';
import RentPatent from './Patenting/RentPatent';

//import About from './About';
//import AdditionalInfo from './AdditionalInfo';

ReactDOM.render(
  <BrowserRouter history={browserHistory}>
    <div>
      <NavigationBar/>
      <switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Timestamp' component={TimestampFree}/>
        <Route exact path='/PersonalTimestamp' render={(props) => (<MetaMaskApp component={TimestampMetaMask.name} header={TimestampMetaMask.header()}/>)}/>
        <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>
        <Route exact path='/DepositPatent' component={(props) => (<MetaMaskApp component={DepositPatent.name} header={DepositPatent.header()}/>)}  />
        <Route exact path='/RentPatent' component={(props) => (<MetaMaskApp component={RentPatent.name} header={RentPatent.header()}/>)}/>
    {/*    <Route exact path='/AdditionalInfo' component={AdditionalInfo}/>
        <Route exact path='/About' component={About}/>*/}

      </switch>
    </div>
  </BrowserRouter>,

  document.getElementById('root')
);

