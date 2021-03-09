import React from 'react';
import './App.css';

import User123 from './user.js'
import RealmForm from './RealmForm.js'
import { BackApi }  from './BackApi.js'

import { useKeycloak } from '@react-keycloak/web'

const App = ()  => {
  const { keycloak, initialized } = useKeycloak();


  const getSecureData = async (event, error) => {
      let response = await BackApi.getSecure(keycloak.token)
      console.log(response);
  }
  console.log('app.js-> localStorage:', sessionStorage.getItem('example-realm'));
  if(sessionStorage.getItem('example-realm')){

    if (keycloak.authenticated) {
      return (
        <div className="App">
          <button
            onClick={getSecureData}>
               getSecureData
          </button>
        </div>
      )
    } else{
      return (
        <div className="App">
          <User123 />
        </div>
      )
    }
  }else{
      return (
        <div className="App">
          <RealmForm />
        </div>
    );
  }
}

export default App;
