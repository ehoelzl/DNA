import React, { Component } from 'react'
import {Route} from 'react-router-dom'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
import NavigationBar from './NavigationBar'
import MetaMaskApp from './MetaMaskApp/MetaMaskApp';
import VerifyTimeStamp from './MetaMaskApp/VerifyTimeStamp'
import TimeStampForm from "./MetaMaskApp/TimeStampForm";
import TimeStampFree from './TimeStampFree';


/*Main Web App component
* */
class Router extends Component {

  render(){ return (
    <div>
      <NavigationBar/>
      <switch>
        {/*<Route exact path='/' component={Home}/>*/}
        <Route exact path='/Timestamp' component={TimeStampFree} />
        <Route exact path='/PersonalTimestamp' render={(props) => (<MetaMaskApp component={TimeStampForm.name}/>)}/>
        <Route exact path='/VerifyTimestamp' render={(props) => (<MetaMaskApp component={VerifyTimeStamp.name}/>)}/>
      </switch>
    </div>
  );
  }

}

export default Router