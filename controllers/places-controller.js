const { v4: uuid } = require('uuid');

const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Place 1',
    description: 'Empire State Building',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Place 2',
    description: 'Empire State Building 2',
    location: {
      lat: 50.7484474,
      lng: -83.9871516
    },
    address: '20 W 34th St, New York, NY 10002',
    creator: 'u2'
  },
  {
    id: 'p2',
    title: 'Place 3',
    description: 'Empire State Building 2',
    location: {
      lat: 50.7484474,
      lng: -83.9871516
    },
    address: '20 W 34th St, New York, NY 10002',
    creator: 'u1'
  }
]

const getAllPlaces = (req, res, next) => {
  if(!DUMMY_PLACES){
    throw new HttpError('No placed found.', 400)
  }
  res.status(200).json({places: DUMMY_PLACES})
}

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid
  const place = DUMMY_PLACES.find(p => p.id === placeId)

  if(!place) {
    throw new HttpError('Could not find place with the given ID', 404)
  }
  res.json({place})
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid
  const userPlaces = DUMMY_PLACES.filter(p => p.creator === userId)

  if(!userPlaces || userPlaces.length === 0) {
    return next(new HttpError('Could not find place with the given user ID', 404))
  }

  res.json({userPlaces})
}

const createPlace = (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422)
  }
  const { title, description, coordinates, address, creator } = req.body

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  }
  DUMMY_PLACES.push(createdPlace)
  res.status(201).json({place: createdPlace})
}

const updatePlaceById = (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422)
  }

  const { title, description } = req.body
  const placeId = req.params.pid

  const updatedPlace = {...DUMMY_PLACES.find( p => p.id === placeId)}
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)

  updatedPlace.title = title
  updatedPlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace

  res.status(200).json({place: updatedPlace})
}

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid
  if(!DUMMY_PLACES.find(p => p.id === placeId)){
    throw new HttpError('Could not find place with the given Id..', 404)
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
  res.status(200).json({message: 'Place deleted successfully.'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.getAllPlaces = getAllPlaces
exports.updatePlaceById = updatePlaceById
exports.deletePlaceById = deletePlaceById
