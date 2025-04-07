const express = require('express');
const {
  getRecurringPatternsByUser,
  addRecurringPattern,
  updateRecurringPattern
} = require('../controllers/recurringPatternController');

const router = express.Router();

router.get('/user/:userId', getRecurringPatternsByUser);
router.post('/', addRecurringPattern);
router.put('/:patternId', updateRecurringPattern);

module.exports = router;
