const express = require('express');
const router = express.Router();

const selectRouter = require('./select');

router.use('/select', selectRouter);

module.exports = router;
