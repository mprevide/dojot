import React, { useState, useEffect } from "react";
import QueryString from "query-string";
import axios from 'axios';

const KEYCLOAK_URL="http://localhost:8000/auth";
const REDIRECT_URL = "http://localhost:8000/?";

const LOGOUT_URL = "http://localhost:8000/pkce/logout";

export default function ReturnLogin(props) {
  console.log('RedirectLogin.js');
  const [data, setData] = useState({});

  useEffect(() => {
    async function newFunction() {
    try{
      const result2 = await axios.get('http://localhost:8000/internal-test');
      const result3 = await axios.get('http://localhost:8000/pkce/userInfo');
      const result = { ...result2.data , ...result3.data}; 
      console.log('result', result );

      setData(result);
    }catch(e){
      console.log(e);
    }

  }
    newFunction();
  },[props]);

  const realm = 'admin';

  const handleLogout  = async (evt) => {

    // const url = urlLogoutKeycloack(realm)

    // console.log('RedirectLogin|','Redirecting to ',url);
// /pkce/logout
    window.location.href = LOGOUT_URL;
  }

  return (
    <div>
        {JSON.stringify(data)}

        <button
          onClick={handleLogout}>
          Logout
        </button>
    </div>
  );
}


// http://auth-server/auth/realms/{realm-name}/protocol/openid-connect/logout?redirect_uri=encodedRedirectUr

  // curl -X POST http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  // -d grant_type=authorization_code \
  // -d redirect_uri=http://localhost:8000/flow_auth/? \
  // -d client_id=gui \
  // -d code_verifier=zo6yP8H9te4I0lk2Uclcry47yPbTT9jRbdnIZPdMUfazH5iD8vkNw \
  // -d code=b937279f-a7f2-46a9-a032-1eb54d78255f.8a298b41-453a-43b1-9762-6902d312b19e.82c8065d-a51e-413a-9358-98572e74e0d3

  // curl -X POST http://localhost:8000/auth/realms/admin/protocol/openid-connect/token \
  // -d grant_type=authorization_code \
  // -d client_id=backstage \
  // -d redirect_uri=http://localhost:8000/flow_auth/? \
  // -d client_secret=ba8da2c9-f3fd-4384-aeae-68d933554a60 \
  // -d code_verifier=zo6yP8H9te4I0lk2Uclcry47yPbTT9jRbdnIZPdMUfazH5iD8vkNw \
  // -d code=9af621f2-b2b7-4279-b676-474be1d928a7.8a298b41-453a-43b1-9762-6902d312b19e.82c8065d-a51e-413a-9358-98572e74e0d3


