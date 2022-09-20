const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRouter = require('./routes/places-routes');
const usersRouter = require('./routes/user-routes');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);

app.use((req, res, next) => {
  const error = new HttpError(
    'Could not find route matching the given path',
    404
  );
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.status || 500);
  res.json({ message: error.message || 'An unkown error occurred!' });
});
mongoose
  .connect('mongodb://localhost:27017/travelia-pk')
  .then(() => app.listen(5000))
  .catch((err) => {
    console.log(err);
  });
