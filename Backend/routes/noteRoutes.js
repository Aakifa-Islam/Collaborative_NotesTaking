const express = require('express');
const noteController = require('../controllers/noteController');
const router = express.Router();

router.post('/notes', noteController.saveNotes);

module.exports = router;