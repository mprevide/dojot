import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { createGlobalState } from 'react-hooks-global-state';

import RedirectLogin from './RedirectLogin.js'
import ReturnLogin from './ReturnLogin.js'

import './App.css';


function App() {
  return (
      <div className="App">
        <Router>
          <Route path='/' exact component={RedirectLogin} />
          <Route path='/flow_auth' component={ReturnLogin} />
        </Router>
      </div>
  );
}

export default App;
