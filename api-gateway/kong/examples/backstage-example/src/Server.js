const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

const { default: axios } = require('axios');
const config = require('./Config');

const {
  generatePKCEChallenge,
  handleErrorAxios
} = require('./Utils');

const {
  urlLoginKeycloack,
  urlLogoutKeycloack,
} = require('./keycloack/Utils');

const {
  getTokenByAuthorizationCode,
  getPermissionsByToken,
  getUserInfoByToken
} = require('./keycloack/Api');

const bodyParser = require('body-parser');
const INTERNAL_TEST_URL="http://apigw:8000/secure";


const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('trust proxy', 1) // trust first proxy
//app.disable('x-powered-by');
app.use(session({
  // genid: function(req) {
  //   return genuuid() // use UUIDs for session IDs
  // },
  secret: config.SECRET,
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
app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

try {
  app.get('/pkce', function(req, res) {
      const {codeVerifier, codeChallenge} = generatePKCEChallenge();
      const url = urlLoginKeycloack(config.PUBLIC_CLIENT_ID,
                  'login-gui',
                  'admin',
                  codeChallenge,
                  config.HASH_LIB)
      req.session.codeChallenge = codeChallenge;
      req.session.codeVerifier = codeVerifier;
      return res.redirect(303,url);
  });

  app.get('/pkce/return', async (req, res) =>  {
    try {
    const {
      state,
      session_state: sessionState,
      code: authorizationCode} = req.query;

    const {
      accessToken,
      expiresIn,
      refreshExpiresIn,
      refreshToken
    } = await getTokenByAuthorizationCode(
      'admin',
      authorizationCode,
      req.session.codeVerifier);

    req.session.accessToken = accessToken;
    req.session.expiresIn = expiresIn;
    req.session.refreshExpiresIn = refreshExpiresIn;
    req.session.refreshToken = refreshToken;

    const permissionsArr = await getPermissionsByToken('admin', accessToken);
    const userInfoObj = await getUserInfoByToken('admin', accessToken);

    req.session.permissions = permissionsArr;
    req.session.userInfo = userInfoObj;

    return res.redirect(303,config.REDIRECT_URL_FRONT);

  } catch(error) {
    console.error('/pkce/return', error);
    res.status(500).send({error: error.message})
  }

  })

  app.get('/pkce/logout', async (req, res) =>  {

    try {
    res.setHeader('Content-Type', 'application/json');

     req.session.destroy(function(err) {
        console.log(err);
      })

    console.log('req.session', req.session)

    urlLogoutKeycloack('admin')


    return res.redirect(303,urlLogoutKeycloack('admin'));

  } catch(error) {
    console.error('/pkce/return', error);
    res.status(500).send({error: error.message})
  }



  })

  app.get('/pkce/userInfo',  async function(req, res) {

    console.log('pkce/userInfo', 'init');
    res.setHeader('Content-Type', 'application/json');
  try{
    if (req.session.accessToken) {
      const { permissions, userInfo} = req.session;

      const result = {
        permissions: permissions,
        ... userInfo
      }
      console.log("result", result);
      res.status(200).json(result);
    }else{
      res.status(403).send({error: "Please, login"})
    }
    } catch(error) {
      res.status(500).send({error: error.message})
    }

  })


  app.get('/internal-test',  async function(req, res) {
    console.log('internal-test');

    res.setHeader('Content-Type', 'application/json');
try{
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
          handleErrorAxios(error);
        }

      res.end();
    }else{
      res.status(403).send({error: "Please, login"})
    }
  }catch (error) {
      res.status(500).send({error: error.message})
    }
  })

  app.listen(8887, () => {
    console.log('Server listen in 8887 \n');
  })

} catch (e) {
  console.error(e);
}





