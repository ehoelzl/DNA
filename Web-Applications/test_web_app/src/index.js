import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

window.addEventListener('load', function () {
  if (typeof window.web3 !== 'undefined'){
    ReactDOM.render(<App />, document.getElementById('root'));
    registerServiceWorker();
  } else {
    ReactDOM.render(<h1>You need a web3 object</h1>, document.getElementById('root'));
    registerServiceWorker();
  }

});
//ReactDOM.render(<App />, document.getElementById('root'));


