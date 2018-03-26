import React, { Component } from 'react'
import {Route} from 'react-router-dom'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import NavigationBar from './NavigationBar'
/*import Home from './Home'*/
import MetaMaskApp from './MetaMaskApp';
import VerifyTimeStamp from './VerifyTimeStamp'
import TimeStampForm from "./TimeStampForm";



class Router extends Component {

  render(){ return (
    <div>
      <NavigationBar/>
      <switch>
        {/*<Route exact path='/' component={Home}/>*/}
        {/*<Route exact path='/PersonalTimestamp' component={MetaMaskApp} />*/}
        <Route exact path='/PersonalTimestamp' render={(props) => (<MetaMaskApp component={TimeStampForm.name}/>)}/>
        <Route exact path='/VerifyTimestamp' render={(props) => (<MetaMaskApp component={VerifyTimeStamp.name}/>)}/>
      </switch>
    </div>
  );
  }

}

export default Router