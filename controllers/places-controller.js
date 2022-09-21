const fs = require('fs');
const { validationResult } = require('express-validator');
const Place = require('../models/place');
const User = require('../models/user');

const HttpError = require('../models/http-error');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not find plaace',
      500
    );
    return next(error);
  }

  if (!place) {
    throw new HttpError('Could not find place with the given ID', 404);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlaces;

  try {
    userPlaces = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      'Could not fetch places. Please try again later.'
    );
    return next(error);
  }

  if (!userPlaces || userPlaces.length === 0) {
    return next(
      new HttpError('Could not find place with the given user ID', 404)
    );
  }

  res.json({
    places: userPlaces.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422);
  }
  const { title, description, address, creator } = req.body;

  console.log(req.file.path);
  const createdPlace = new Place({
    title,
    description,
    image: req.file.path,
    address,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed. Please try again later',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for the provided id', 404);
    return next(error);
  }

  try {
    await createdPlace.save();
    user.places.push(createdPlace);
    await user.save();
  } catch (err) {
    const error = new HttpError('Could not create place', 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid input passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not find place',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not authorized to perform this action..',
      401
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not updated place',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not find place',
      500
    );
    return next(error);
  }
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not authorized to perform this action..',
      401
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place with the given Id', 500);
    return next(error);
  }

  const imagePath = place.image;

  try {
    await place.remove();
    place.creator.places.pull(place);
    await place.creator.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not delete place',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => console.log(err));
  res.status(200).json({ message: 'Place deleted successfully.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
