/* eslint-disable import/no-anonymous-default-export */
import { useKeycloak } from '@react-keycloak/web'

export default (props) => {
  // Using Object destructuring
  console.log('useKeycloak', useKeycloak());
  const { keycloak, initialized } = useKeycloak()

  const cleanRealmStorage = () => {
    sessionStorage.removeItem('example-realm');
    window.location.reload();
  }

  console.log('keycloak', keycloak);
  console.log('keycloak.authenticated', keycloak.authenticated);

  if (initialized===false && keycloak.authenticated===false) {
    return (<div>Não foi possivel inicializar o realm {keycloak.realm}
    <button
        onClick={cleanRealmStorage}>
        Tentar outro realm
    </button>
    </div>);
  }

  if (initialized===false && keycloak.authenticated===true) {
    return (<div>Loading...</div>);
  }

  const handleLogInOut = () => {
    if (keycloak.authenticated) {
      keycloak.logout()
      cleanRealmStorage();
    } else {
      keycloak.login()
    }
  }


  const getUsername = () => {
    return keycloak.authenticated && keycloak.tokenParsed && keycloak.tokenParsed.preferred_username
  }

  const getLogInOutText = () => {
    return keycloak.authenticated ? "Logout" : "Login"
  }

  console.log('user.js -> ', keycloak);

  return (
      <div>
        {getUsername()}
        <button
        onClick={handleLogInOut}>
          {getLogInOutText()}
        </button>
    </div>
  )
}