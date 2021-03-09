import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import './App.css';

import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

import User123 from './user.js'
import RealmForm from './realm.js'



function App() {
  const initOptions = { pkceMethod: 'S256' }

  // console.log('this.props.location.search', this.props.location.search)

  return (
    <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={initOptions}
    >
      <div className="App">
        <Router>
          <Route path='/' exact component={RealmForm} />
          <Route path='/login' component={User123} />
          <Route component={RealmForm} />
        </Router>
      </div>
    </ReactKeycloakProvider>
  );
}

export default App;
