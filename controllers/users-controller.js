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
    throw new HttpError('Signing up failed. Please try again later', 500);
  }

  if (existingUser) {
    throw new HttpError('Could not create user: User already exists..', 422);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image:
      'https://images.unsplash.com/photo-1581084514519-8b6b0b0b0b1c?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhY2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80',
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

  res.json({ message: 'Logged In..' });
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;
