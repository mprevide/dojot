import React from "react";
import { Redirect } from "react-router-dom";

const PKCE_URL="http://localhost:8000/pkce";


export default function RedirectLogin(props) {

  // const realm = props.tenant;
  const realm = 'admin';

  const handleRedirectLogin = async (evt) => {
    window.location.href = PKCE_URL+'?realm='+realm;
  }

  return (
      <button
      onClick={handleRedirectLogin}>
        Login
      </button>
  );
}

