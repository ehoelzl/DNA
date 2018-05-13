import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, browserHistory} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import './css/index.css'

import NavigationBar from './NavigationBar'
import Home from './Home';
import TimestampMetaMask from "./Timestamp/TimestampMetaMask";
import TimestampFree from './Timestamp/TimestampFree';
import VerifyTimestamp from './VerifyTimestamp/VerifyTimestamp';
import DepositPatent from './Patenting/DepositPatent';
import BuyPatent from './Patenting/BuyPatent';
import MyPatents from './Patenting/MyPatents';


//import About from './About';
//import AdditionalInfo from './AdditionalInfo';

ReactDOM.render(
  <BrowserRouter history={browserHistory}>
    <div>

      <NavigationBar/>
      <switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Timestamp' component={TimestampFree}/>
        <Route exact path='/PersonalTimestamp' component={TimestampMetaMask}/>
        <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>
        <Route exact path='/DepositPatent' component={DepositPatent}/>
        <Route exact path='/RentPatent' component={BuyPatent}/>
        <Route exact path='/MyPatents' component={MyPatents}/>
      </switch>
    </div>
  </BrowserRouter>,

  document.getElementById('root')
);

