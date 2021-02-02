// const http = require('http');

// try {

//   http.createServer((req, res) => {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.write('Hello World!');
//     console.log('Sending msg for client...');
//     res.end('Msg from server\n');
//   })
//     .on('clientError', (err, socket) => {
//       socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
//     })
//     .listen(8888);

//   console.log('Server listen in 8888');
// } catch (e) {
//   console.error(e);
//   process.kill(process.pid, 'SIGTERM');
// }

var express = require('express');
var app = express();
try {

  app.get('/secure', function(req, res) {
    console.log(req.headers)
    res.send('secure route')
  });

  app.get('/insecure', function(req, res) {
    console.log(req.headers)
    res.send('insecure route')
  });

  app.listen(8888, () => {
    console.log('Server listen in 8888');
  })

} catch (e) {
  console.error(e);
  process.kill(process.pid, 'SIGTERM');
}