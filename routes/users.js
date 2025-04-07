const express = require('express');
const { getUserById, updateUser } = require('../controllers/userController');

const router = express.Router();

router.get('/:userId', getUserById);
router.put('/:userId', updateUser);

module.exports = router;