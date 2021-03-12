import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Config from './Config.js'

export default function RedirectLogin() {

  const [realm, setRealm] = useState('admin');
  const state = 'login-gui';

  const handleRedirectLogin = async (evt) => {
    console.log('HandleRedirectLogin/Realm:', realm);
    window.location.href = Config.PKCE_URL+'?realm='+realm+'&state='+state;
  }

  return (
    <div>
      <label>
        Realm
          <input
            type="text"
            value={realm}
            onChange={e => setRealm(e.target.value)}
          />
      </label>
      <button
        onClick={handleRedirectLogin}>
        Login
      </button>
    </div>
  );
}

