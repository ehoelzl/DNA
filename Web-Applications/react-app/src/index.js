import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.css'

import './css/index.css'

import NavigationBar from './NavigationBar'
import Home from './Home';
import TimestampMetaMask from "./Timestamp/TimestampMetaMask";
import TimestampFree from './Timestamp/TimestampFree';
import VerifyTimestamp from './VerifyTimestamp/VerifyTimestamp';
import DepositPatent from './Patenting/DepositPatent';
import RequestAccess from './Patenting/RequestAccess';
import MyPatents from './Patenting/MyPatents';
import MyRequests from './Patenting/MyRequests'
import dotenv from 'dotenv';


//import About from './About';
//import AdditionalInfo from './AdditionalInfo';

dotenv.config();
ReactDOM.render(
  <BrowserRouter>
    {/*<BrowserRouter history={browserHistory}>*/}
    <div>
      <NavigationBar/>
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Timestamp' component={TimestampFree}/>
        <Route exact path='/PersonalTimestamp' component={TimestampMetaMask}/>
        <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>
        <Route exact path='/DepositPatent' component={DepositPatent}/>
        <Route exact path='/RequestAccess' component={RequestAccess}/>
        <Route exact path='/MyPatents' component={MyPatents}/>
        <Route exact path='/MyRequests' component={MyRequests}/>
      </Switch>
    </div>
  </BrowserRouter>,

  document.getElementById('root')
);

