import React from "react";
import axios from 'axios';

const REDIRECT_URL = "http://localhost:8000/flow_auth/?";
const KEYCLOAK_URL="http://localhost:8000/auth";
const PKCE_URL="http://localhost:8000/pkce";

const urlLoginKeycloack = (realm, codeChallenge, codeChallengeMethod) =>{
  const clientId = 'gui'
  const redirect_uri = encodeURIComponent(REDIRECT_URL)
  const state='125f9cf4-f643-4856-b4df-b8da56878b2d';
  const nonce='fe3ecdf4-0ce3-487e-874a-f4df98f31af7';
  return KEYCLOAK_URL+
              "/realms/"
              +realm+"/protocol/openid-connect/auth?"+
              "client_id="+clientId+
              "&redirect_uri="+redirect_uri+
              "&state="+state+
              "&response_mode=fragment"+
              "&response_type=code"+
              "&scope=openid"+
              "&nonce="+nonce+
              "&code_challenge="+codeChallenge+
              "&code_challenge_method="+codeChallengeMethod;
}

export default function RedirectLogin(props) {

  // const realm = props.tenant;
  const realm = 'admin';

  const handleRedirectLogin = async (evt) => {
    const {
      data:{
        codeChallenge,
        codeChallengeMethod, //"S256"
        //newSession
      }
    }  = await axios.get(PKCE_URL);

    console.log('RedirectLogin|','codeChallenge:',codeChallenge);
    console.log('RedirectLogin|','codeChallengeMethod:',codeChallengeMethod);
    const url = urlLoginKeycloack(realm, codeChallenge, codeChallengeMethod)

    console.log('RedirectLogin|','Redirecting to ',url);

    window.location.href = url;
  }

  return (
      <button
      onClick={handleRedirectLogin}>
        Login
      </button>
  );
}

