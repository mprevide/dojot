import React, { useState, useEffect } from "react";
import axios from 'axios';
import Config from './Config.js'

export default function ReturnLogin() {

  const [data, setData] = useState({
    data: {},
    userInfo: {},
    currentSession: {}
  });

  // useEffect(() => {
  //   async function call() {
  //     try{
  //       const { data: resultUserInfo } = await axios.get(Config.USER_INFO_URL);
  //       const { data: resultData } = await axios.get(Config.INTERNAL_DATA_URL);
  //       //const { data: resultCurrentSession } = await axios.get(Config.CURRENT_SESSION_URL);

  //       setData({
  //        data: resultData,
  //        userInfo: resultUserInfo,
  //         //currentSession: resultCurrentSession,
  //       });

  //     }catch(e){
  //       console.log(e);
  //     }
  // }
  //   //call();
  // },[]);

  const handleLogout  = async (evt) => {
    window.location.href = Config.LOGOUT_URL;
  }

  const handleUserData  = async (evt) => {
    const { data: resultData } = await axios.get(Config.INTERNAL_DATA_URL);

    setData({
      data: resultData,
     });
  }

  const handleUserInfo  = async (evt) => {
    const { data: resultUserInfo } = await axios.get(Config.USER_INFO_URL);

    setData({
      userInfo: resultUserInfo,
     });
  }

  return (
    <div>
     <button
      onClick={handleUserData}>
      Request Data 
    </button>
    <span>Data: {JSON.stringify(data.data)}</span>
    <button
    onClick={handleUserInfo}>
    Request User info
  </button>
  <span>User Info: {JSON.stringify(data.userInfo)}</span>
    <button
      onClick={handleLogout}>
      Logout
    </button>
    </div>
  );
}

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


