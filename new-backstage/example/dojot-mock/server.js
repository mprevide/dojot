/* eslint-disable no-console */
const express = require('express');
const mocks = require('./mock');

const app = express();

try {
  app.get('/device', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).end(JSON.stringify(mocks.devices));
  });

  app.get('/device/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.params.id === 'ab00f6') {
      res.status(200).end(JSON.stringify(mocks.device1));
    } else if (req.params.id === '47f6e0') {
      res.status(200).end(JSON.stringify(mocks.device2));
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/device/template/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.params.id === '1') {
      res.status(200).end(JSON.stringify(mocks.devicesInTemplate));
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/template/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.params.id === '1') {
      res.status(200).end(JSON.stringify(mocks.template));
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/history/device/:id/history', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.params.id === 'ab00f6' && req.query.attr === 'attrDyInt') {
      res.status(200).end(JSON.stringify(mocks.historyDevice1AttrDyInt));
    } else if (req.params.id === 'ab00f6' && req.query.attr === 'attrDyStr') {
      res.status(200).end(JSON.stringify(mocks.historyDevice1AttrDyStr));
    } else {
      res.sendStatus(404);
    }
  });

  app.listen(8888, () => {
    console.log('Server listen in 8888 \n');
  });
} catch (e) {
  console.error(e);
  process.kill(process.pid, 'SIGTERM');
}
