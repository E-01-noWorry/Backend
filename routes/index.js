const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require("./user")
const voteRouter = require('./vote');

router.use('/select', selectRouter);
router.use("/", userRouter);
router.use('/select/vote', voteRouter);
module.exports = router;
