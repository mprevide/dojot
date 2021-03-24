import React, { useState, useEffect } from "react";
import axios from 'axios';
import Config from './Config.js'

export default function ReturnLogin() {

  const [data, setData] = useState({
    dataExample: {},
    userInfo: {},
    // currentSession: {}
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
    try{
    const { data: resultData } = await axios.get(Config.EXAMPLE_DATA_URL);
      setData({
        ...data,
        dataExample: resultData,
      });
    }catch(error){
      if (error.response && error.response.status && error.response.data) {
        console.log(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }else{
        console.log(error);
      }
    }
  }

  const handleUserInfo  = async (evt) => {
    try{
      const { data: resultUserInfo } = await axios.get(Config.USER_INFO_URL);
      setData({
        ...data,
        userInfo: resultUserInfo,
      });
    }catch(error){
      if (error.response && error.response.status && error.response.data) {
        console.log(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }else{
        console.log(error);
      }
    }
  }

  return (
    <div>
      <div>
        <button
          onClick={handleUserData}>
          Request Data Example
        </button>
        <span>Data from example: {JSON.stringify(data.dataExample)}</span>
      </div>
    <div>
        <button
        onClick={handleUserInfo}>
          Request User info
        </button>
        <span>User Info: {JSON.stringify(data.userInfo)}</span>
    </div>
    <div>
      <span> Logout? </span>
      <button
        onClick={handleLogout}>
        Yes
      </button>
    </div>
  </div>
  );
}