import React, { useState, useEffect } from "react";
import axios from 'axios';
import Config from './Config.js'


export default function ReturnLogin(props) {

  const [data, setData] = useState({
    dataExample: {},
    state: 'none',
    userInfo: {},
    errorMsg: 'none',
  });

  // getting the parameter state e error (if it exists) in the query string
  const paramsQueryString = new URLSearchParams(props.location.search);
  const stateQueryString = paramsQueryString.get('state') || 'none';
  const errorQueryString = paramsQueryString.get('error');

  useEffect(() => {
    async function call() {
      try{
        const { data: resultUserInfo,
          status,
          statusText,
         } = await axios.get(Config.USER_INFO_URL);
         if (status === 200) {
            setData({
              ...data,
              state: stateQueryString,
              userInfo: resultUserInfo,
            });
          }else {
            throw new Error('Unable to verify an active session');
          }
      }catch(error){
        // redirect to the homepage or do something else
        // ######
        // 401 is a known error
        if (error.response && error.response.status===401){
          setData({
            ...data,
            errorMsg: `${error.response.status}: ${JSON.stringify(error.response.data)}`,
          });
        }else{
          setData({
            ...data,
            errorMsg: error.message,
          });
        }
      }
  }
    // checks if there is an error parameter in the querystring
    if(!errorQueryString){
        call();
      } else {
        // redirect to the homepage or do something else
        // ######
        // passing here means that something went wrong in the login
        // and an error was answered in the return query string
        setData({
          ...data,
          errorMsg: errorQueryString,
        });
      }

  },[]);

  const handleExampleData  = async (evt) => {
    try{
    const { data: resultData } = await axios.get(Config.EXAMPLE_DATA_URL);
      setData({
        ...data,
        dataExample: resultData,
        errorMsg:'none',
      });
    }catch(error){
        // redirect to the homepage or do something else
        // ######
        // 401 is a known error
        if (error.response && error.response.status===401){
          setData({
            ...data,
            dataExample: {},
            errorMsg: `${error.response.status}: ${JSON.stringify(error.response.data)}`,
          });
        }else{
          setData({
            ...data,
            dataExample: {},
            errorMsg: error.message,
          });
        }
      }
  }

  const handleLogout  = async (evt) => {
    window.location.href = Config.LOGOUT_URL;
  }

  return (
    <div>
      <div>
          <span>User Info: {JSON.stringify(data.userInfo)}</span>
      </div>
      <div>
        <span> Logout? </span>
        <button
          onClick={handleLogout}>
          Yes
        </button>
      </div>
      <div>
        <span>State: {data.state} </span>
      </div>
      <div>
        <span>Error: {data.errorMsg} </span>
      </div>
      <div>
        <div>-----------------</div>
        <div>Data from example</div>
        <button
          onClick={handleExampleData}>
          Request Data
        </button>
        <div>Data: {JSON.stringify(data.dataExample)}</div>
      </div>
    </div>
  );
}
