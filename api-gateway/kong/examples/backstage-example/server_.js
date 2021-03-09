const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const KONG_URL = 'http://apigw:8000';

const app = express();
const memoryStore = new session.MemoryStore();
​let kcConfig = {
  ​clientId: 'myclient',
  ​bearerOnly: true,
  ​serverUrl: 'http://localhost:8080/auth',
  ​realm: 'myrealm',
  ​realmPublicKey: 'MIIBIjANB...'
​};
const keycloak = new Keycloak({ store: memoryStore }, kcConfig);
// ​var keycloak = new Keycloak({ scope: 'offline_access'});

// ​app.set( 'trust proxy', true );

//app.use( keycloak.middleware( { logout: '/logoff' } ));
//     ​app.use( keycloak.middleware( { admin: '/callbacks'

try {

  ​app.use(keycloak.middleware());

  app.get('/check-sso', keycloak.checkSso(), (req, res) => {

    console.log('req', req);
    // const {type} = req.body;
    // const bearer_token = req.headers.authorization;
    // const token = bearer_token.split(' ')[1];
    // const decoded_token = jwt_decode(token);
    // if (type.toLowerCase() === constants.TYPE.collage) {
    //     res.send(utils.checkCompatibilityCollage(req.body))
    // } else if (type.toLowerCase() === constants.TYPE.composition) {
    //     res.send(utils.checkCompatibilityComposition(req.body))
    // }

  });

  app.listen(8887, () => {
    console.log('Server listen in 8887 \n');
  })

} catch (e) {
  console.error(e);
  process.kill(process.pid, 'SIGTERM');
}

