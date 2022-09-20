const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');
const placesController = require('../controllers/places-controller');

const router = express.Router();

router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);

router.post(
  '/',
  fileUpload.single('image'),
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlaceById
);

router.delete('/:pid', placesController.deletePlaceById);

module.exports = router;
