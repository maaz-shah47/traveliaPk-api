const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user. Please try again..',
      500
    );
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Could not create user', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'secret_key',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Could not Sign in user', 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
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

  if (!identifiedUser) {
    const error = new HttpError('Invalid credentials. Please try again', 401);
    return next(error);
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await bcrypt.compare(password, identifiedUser.password);
  } catch (error) {
    const err = new HttpError(
      'Could not logged in. Please check your credentails again.'
    );
    return next(err);
  }

  if (!isPasswordValid) {
    const err = new HttpError(
      'Could not logged in. Please check your credentails again.'
    );
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      'secret_key',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Could not Sign in user', 500);
    return next(error);
  }

  res.json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token,
  });
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
