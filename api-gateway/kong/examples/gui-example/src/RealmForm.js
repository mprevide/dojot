import React, { useState } from "react";

export default function RealmForm(props) {
  const [realm, setRealm] = useState("");

  const handleSubmit = (evt) => {
    sessionStorage.setItem('example-realm', realm);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Realm:
        <input
          type="text"
          value={realm}
          onChange={e => setRealm(e.target.value)}
        />
      </label>
      <input type="submit" value="Ok" />
    </form>
  );
}

