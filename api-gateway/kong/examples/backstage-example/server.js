const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

const { default: axios } = require('axios');

const { generatePKCEChallenge } = require('./Utils');
const { getTokenByAuthorizationCode, getPermissionsByToken } = require('./KeycloackAPi.js');
const bodyParser = require('body-parser');

// const APIGW_URL = 'http://apigw:8000';
// const KEYCLOAK_URL="http://apigw:8000/auth";
const INTERNAL_TEST_URL="http://apigw:8000/secure";

const SECRET = 'keyboard cat';
const HASH_LIB = 'S256';



const  loggingErrorsAxios = (error) =>  {
  if (error.response) {
    // Request made and server responded
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
  }
}


function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}


const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(logErrors);
app.use(errorHandler);
app.set('trust proxy', 1) // trust first proxy
//app.disable('x-powered-by');
app.use(session({
  // genid: function(req) {
  //   return genuuid() // use UUIDs for session IDs
  // },
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path: '/', //Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
    httpOnly: true, //Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
    secure: false, //Assegura que o navegador só envie o cookie por HTTPS.
    maxAge: null, //Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute. This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, no maximum age is set.
    sameSite:  'strict', // Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
  }
}))

app.use(helmet());

try {
  app.get('/pkce', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      const {codeVerifier, codeChallenge} = generatePKCEChallenge();
      console.log("codeChallenge", codeChallenge);
      req.session.codeChallenge = codeChallenge;
      req.session.codeVerifier = codeVerifier;
      res.status(200).json({
        codeChallenge,
        codeChallengeMethod: HASH_LIB,
      });
  });

  app.post('/pkce/return', async (req, res) =>  {

    //reponder com login, e permisoes?
    try {
    res.setHeader('Content-Type', 'application/json');
    console.log('Got body:', req.body);
    console.log('Got session:', req.session);
    const {
      authorizationCode,
      sessionState,
      state,
    } = req.body;
    const {
      accessToken,
      expiresIn,
      refreshExpiresIn,
      refreshToken
    } = await getTokenByAuthorizationCode(
      'admin',
      authorizationCode,
      req.session.codeVerifier);


    console.log('accessToken', accessToken)
    req.session.accessToken = accessToken;

    const arr = await getPermissionsByToken('admin', accessToken);

    res.status(200).json(arr);
  } catch(error) {
    console.error('/pkce/return', error);
    res.status(500).send({error: error.message})
  }

  })

  app.get('/internal-test', async function(req, res) {

    console.log('internal-test');
    console.log(req.session);
    //curl -X GET "http://localhost:8000/secure" -H  "Authorization: Bearer ${JWT}"
    res.setHeader('Content-Type', 'application/json');
    if (req.session.accessToken) {

  try{
      const  result = await axios.get(
        INTERNAL_TEST_URL,
        {headers:
          { 'content-type': 'application/json',
        'Authorization': 'Bearer ' + req.session.accessToken
        }}
        
        ,

      );
      console.log("result.data", result.data);
      res.status(200).json(result.data);
    } catch(error) {
      loggingErrorsAxios(error);
      res.status(500).send({error: error.message})
    }

      res.end();
    }
  })

  app.listen(8887, () => {
    console.log('Server listen in 8887 \n');
  })

} catch (e) {
  console.error(e);
}





