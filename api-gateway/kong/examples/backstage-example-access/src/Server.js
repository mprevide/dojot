const express = require('express');

const session = require('express-session');
const helmet = require('helmet');

let RedisStore = require('./redis/StoreExpressSession')(session);

const { default: axios } = require('axios');
const config = require('./Config');

const {
  generatePKCEChallenge,
  handleErrorAxios
} = require('./Utils');

const bodyParser = require('body-parser');
const INTERNAL_TEST_URL="http://apigw:8000/secure";

//https://www.npmjs.com/package/csurf
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'aabcde ddd',
  store: new RedisStore(),
  // resave: true,
  // saveUninitialized: true,
  // cookie: {
  //   path: '/', //Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
  //   httpOnly: true, //Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
  //   secure: false, //Assegura que o navegador só envie o cookie por HTTPS.
  //   // maxAge: null, //Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute. This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, no maximum age is set.
  //   //sameSite:  'strict', // Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
  //   //domain?
  //   domain: 'example.com',
  // }
}))

app.use(helmet());
app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

try {
  app.get('/internal-test',  async function(req, res) {
    console.log('internal-test');
  try{
    console.log('req.header', req.header);
    console.log('req.session', req.session);
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





