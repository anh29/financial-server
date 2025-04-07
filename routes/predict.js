const express = require('express');
const {
  predictCategory,
  predictUsageDuration,
} = require('../controllers/predictionController');

const router = express.Router();

router.post('/category', predictCategory);
router.post('/duration', predictUsageDuration);

module.exports = router;
