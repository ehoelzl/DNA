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
import DepositFile from './Patenting/DepositFile';
import Store from './Patenting/Store';
import MyFiles from './Patenting/MyFiles';
import MyRequests from './Patenting/MyRequests'
import dotenv from 'dotenv';

import Dialog from 'react-bootstrap-dialog';


import About from './About';
//import AdditionalInfo from './AdditionalInfo';

dotenv.config();
ReactDOM.render(
  <BrowserRouter>
    {/*<BrowserRouter history={browserHistory}>*/}
    <div>
      <NavigationBar/>
      <Dialog ref={(el) => { window.dialog = el }} />
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route exact path='/Timestamp' component={TimestampFree}/>
        <Route exact path='/PersonalTimestamp' component={TimestampMetaMask}/>
        <Route exact path='/VerifyTimestamp' component={VerifyTimestamp}/>
        <Route exact path='/DepositFile' component={DepositFile}/>
        <Route exact path='/Store' component={Store}/>
        <Route exact path='/MyFiles' component={MyFiles}/>
        <Route exact path='/MyRequests' component={MyRequests}/>
        <Route exact path='/About' component={About}/>
      </Switch>
    </div>
  </BrowserRouter>,

  document.getElementById('root')
);

