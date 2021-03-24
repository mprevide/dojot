import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import Config from './Config.js'

export default function RedirectLogin() {

  const [tenant, setTenant] = useState('admin');
  const state = 'login-gui';

  const handleRedirectLogin = async (evt) => {
    window.location.href = Config.LOGIN_URL+'?tenant='+tenant+'&state='+state;
  }

  return (
    <div>
      <label>
      Tenant/Realm:
          <input
            type="text"
            value={tenant}
            onChange={e => setTenant(e.target.value)}
          />
      </label>
      <div>
      <button
        onClick={handleRedirectLogin}>
        Go to login page
      </button>
      </div>
    </div>
  );
}

