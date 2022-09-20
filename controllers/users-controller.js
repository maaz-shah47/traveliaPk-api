const { v4: uuid } = require('uuid');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Could not fetch users', 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed. Please try again late',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'Could not create user: User already exists..',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Could not create user', 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422);
  }

  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Error while logging in. Please try again',
      500
    );
    return next(error);
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError('Invalid credentials. Please try again', 401);
    return next(error);
  }

  res.json({
    message: 'Logged In..',
    user: identifiedUser.toObject({ getters: true }),
  });
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
