const express = require("express");
const {
  createRecord,
  getAllRecords,
  getRecordsByUser,
  getRecordById,
  updateRecord,
  deleteRecordById
} = require("../controllers/crud.controller");

const router = express.Router();

router.post('/:type', createRecord);
router.get('/:type/all', getAllRecords);
router.get('/:type/user/:userId', getRecordsByUser);
router.get('/:type/id/:id', getRecordById);
router.put('/:type', updateRecord);
router.delete('/:type/id/:id', deleteRecordById);

module.exports = router;
