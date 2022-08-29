const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const voteRouter = require('./vote');

router.use('/select', selectRouter);
router.use('/select/vote', voteRouter);
module.exports = router;
