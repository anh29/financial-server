const express = require('express');
const {
  getAllTransactions,
  getTransactionsByUser,
  getAmortizedTransactionsByUser,
  addTransaction,
  updateTransactionById
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/user/:userId', getTransactionsByUser);
router.get('/user/:userId/amortized', getAmortizedTransactionsByUser);
router.post('/', addTransaction);
router.put('/', updateTransactionById);

module.exports = router;
