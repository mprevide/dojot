const express = require('express');
const app = express();

const parseJWT = (headers)=>{
  console.log(headers)
}
try {

  app.get('/secure', (req, res) =>  {
    parseJWT(req.headers)
    res.send('GET - secure route')
  });

  app.post('/secure', (req, res) =>  {
    parseJWT(req.headers)
    res.send('POST - secure route');
  });

  app.put('/secure', (req, res) => {
    parseJWT(req.headers)
    res.send('PUT - secure route');
  });

  app.delete('/secure', (req, res) => {
    parseJWT(req.headers)
    res.send('DELETE - secure route');
  });

  app.get('/insecure', (req, res) =>  {
    res.send('GET - insecure route')
  });

  app.post('/insecure', (req, res) =>  {
    res.send('POST - insecure route')
  });

  app.listen(8888, () => {
    console.log('Server listen in 8888');
  })

} catch (e) {
  console.error(e);
  process.kill(process.pid, 'SIGTERM');
}