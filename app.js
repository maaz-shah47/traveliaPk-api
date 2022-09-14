const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRouter = require('./routes/places-routes');
const usersRouter = require('./routes/user-routes');

const app = express();

app.use(bodyParser.json());

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
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.status || 500);
  res.json({ message: error.message || 'An unkiwn error occurred!' });
});

mongoose
  .connect(
    'mongodb+srv://MaazShah:Maazshah0071@cluster0.rcufx.mongodb.net/places?retryWrites=true&w=majority'
  )
  .then(() => app.listen(5000))
  .catch((err) => {
    console.log(err);
  });
