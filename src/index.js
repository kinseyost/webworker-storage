/* eslint-disable no-console*/

import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import colors from 'colors';
import bodyParser from 'body-parser';
import multer from 'multer';
import saveFiles from './saveFiles.js';

var upload = multer({ dest: 'uploads/' });

const isRunningInDocker = process.env.DOCKER_DB;

const app = express();
const server = http.Server(app);
const port = 8082;
let shouldConnect = 0;

app.get('/', (req, res) => {
  res.status(200).send('<h1>Welcome to Storage</h1>');
});

app.post('/uploads.json', upload.array('files'), (req, res) => {
  const files = req.files;
  console.log('Successfully uploaded', files.length, 'Files');
  res.status(200).send('Got the goods');
});

server.listen(port, () => {
  console.log(`listening on :${port}`);
});

/* If running in docker use the container name, otherwise, localhost */
const url = isRunningInDocker ? 'mongo:27017' : 'localhost/test';
connectToDb();

function connectToDb() {
  mongoose.connect(`mongodb://${url}`, { useMongoClient: true });
}

const db = mongoose.connection;
db.on('error', (err) => {
  console.error.bind(console, 'connection error:');
  server.close(function() {
    console.log(err);
    setTimeout(() => {
      console.log('reconnecting');
      connectToDb()
    }, 1000);
  });
});
db.once('open', () => {
  console.log('connected to mongodb');
});
