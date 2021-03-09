import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak'

const initOptions = { pkceMethod: 'S256' }

const eventLogger = (event, error) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens) => {
  console.log('onKeycloakTokens', tokens)
}

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
      initOptions={initOptions}
    >
      <App />
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister();
