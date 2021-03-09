import Keycloak from 'keycloak-js'
const currentRealm =  sessionStorage.getItem('example-realm') || 'qe';

console.log('keycloak.js-> sessionStorage:', sessionStorage.getItem('example-realm'));
console.log('keycloak.js-> currentRealm:', currentRealm);

const keycloak = new Keycloak(

    {
        url: `http://localhost:8000/auth`,
        realm: currentRealm,
        clientId: "gui"
      }
)
export default keycloak