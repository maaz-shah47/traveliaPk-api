const { v4: uuid } = require('uuid');

const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Maaz shah',
    email: 'maazshah@gmail.com',
    password: 'test'
  }
]
const getAllUsers = (req, res, next) => {
  res.json({users: DUMMY_USERS})
}

const signup = (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422)
  }

  const { name, email, password } = req.body

  const hasUser = DUMMY_USERS.find(user => user.email === email)

  if(hasUser){
    throw new HttpError('Could not create user: Email already exists..', 422)
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password
  }

  DUMMY_USERS.push(createdUser)
  res.status(201).json({user: createdUser})
}

const login = (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422)
  }

  const { email, password } = req.body

  const identifiedUser = DUMMY_USERS.find(user => user.email === email)

  if(!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Could not find user with the given email', 401)
  }

  res.json({message: 'Logged In..'})
}

exports.getAllUsers = getAllUsers
exports.signup = signup
exports.login = login
