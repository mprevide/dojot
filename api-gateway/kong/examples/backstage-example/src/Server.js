const express = require('express');

const session = require('express-session');
const helmet = require('helmet');

const RedisSub = require('./redis/Subscribe');

const redisSub = new RedisSub();
redisSub.initSubscribe().then(()=>{
  console.log('initSubscribe ok');
}).catch((error)=>{
  console.error('initSubscribe', error);
})

//await this.redisExpirationMgmt.initSubscribe();


let RedisStore = require('./redis/StoreExpressSession')(session);

const { default: axios } = require('axios');
const config = require('./Config');

const {
  generatePKCEChallenge,
  handleErrorAxios
} = require('./Utils');

const {
  urlLoginKeycloak,
  urlLogoutKeycloak,
} = require('./keycloak/Utils');

const {
  getTokenByAuthorizationCode,
  getPermissionsByToken,
  getUserInfoByToken
} = require('./keycloak/Api');

const bodyParser = require('body-parser');
const INTERNAL_TEST_URL="http://apigw:8000/secure";


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy
//app.disable('x-powered-by');
app.use(session({
  secret: config.SECRET,
  store: new RedisStore(),
  resave: true,
  // saveUninitialized: true,
  cookie: {
    path: '/', //Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
    httpOnly: true, //Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
    secure: false, //Assegura que o navegador só envie o cookie por HTTPS.
    // maxAge: null, //Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute. This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, no maximum age is set.
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
     console.log('/pkce init');
      const { realm, state } =  req.query;
      const newState = state ? 'login-state': state;

      if (realm){
        const {codeVerifier, codeChallenge} = generatePKCEChallenge();
        const url = urlLoginKeycloak(
          config.PUBLIC_CLIENT_ID,
          newState,
          realm,
          codeChallenge,
          config.HASH_LIB);
        req.session.codeChallenge = codeChallenge;
        req.session.codeVerifier = codeVerifier;
        req.session.realm = realm;

        console.log('/pkce will return');
        return res.redirect(303,url);
      }
 
      return res.status(401).send({error: 'Missing attribute realm in query.'})
  });


  app.get('/pkce/current', async (req, res) =>  {
    console.log('/pkce/current init');
    //console.log('/pkce/return req.session antes', req.session );
    const hour = 100*1000; //3600000
    const time  = new Date(Date.now() + hour);
    console.log('time', time);
   // console.log('time ms', time.getTime());
    //console.log('time sec', time.getTime() / 1000);
    req.session.cookie.expires = time;

    console.log('req.session ', req.session );
    res.status(200).json(req.session);
  });


  app.get('/pkce/return', async (req, res) =>  {
    console.log('/pkce/return init');
    //console.log('/pkce/return req.session antes', req.session );
    const hour = 20*1000; //3600000
    const time  = new Date(Date.now() + hour);
    console.log('time', time);
   // console.log('time ms', time.getTime());
    //console.log('time sec', time.getTime() / 1000);
    req.session.cookie.expires = time;
    //console.log('req.session depois', req.session );
    const {
      realm,
      codeVerifier
    } = req.session ;

    //if se sessian exist
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
        realm,
        authorizationCode,
        codeVerifier);

    req.session.accessToken = accessToken;
    req.session.expiresIn = expiresIn;
    req.session.refreshExpiresIn = refreshExpiresIn;
    req.session.refreshToken = refreshToken;

    const permissionsArr = await getPermissionsByToken(realm, accessToken);
    const userInfoObj = await getUserInfoByToken(realm, accessToken);

    req.session.permissions = permissionsArr;
    req.session.userInfo = userInfoObj;

    console.log('/pkce/return will return');
    return res.redirect(303,config.REDIRECT_URL_FRONT);

  } catch(error) {
    console.error('/pkce/return', error);
    res.status(500).send({error: error.message});
  }

  })

  app.get('/pkce/logout', async (req, res) =>  {

    try {
      //if se sessian exist, senao ir pra tela home
      const { realm } = req.session ;

      req.session.destroy(function(err) {
          console.log(err);
      })

      return res.redirect(303,urlLogoutKeycloak(realm));

  } catch(error) {
    console.error('/pkce/return', error);
    res.status(500).send({error: error.message})
  }

  });

app.get('/pkce/userInfo',  async function(req, res) {
  console.log('pkce/userInfo', 'init');
  try {
      const { permissions, userInfo, accessToken} = req.session;
      if (accessToken && permissions && userInfo) {
        ///update this infos
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
  };

});


  app.get('/internal-test',  async function(req, res) {
    console.log('internal-test');
  try{
    const { accessToken } = req.session;
    if (accessToken) {
      try{
        const result = await axios.get(
              INTERNAL_TEST_URL,
              { headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
                }
              },
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
      } catch (error) {
        res.status(500).send({error: error.message})
      }
  })

  app.listen(8887, () => {
    console.log('Server listen in 8887 \n');
  })

} catch (e) {
  console.error(e);
}





