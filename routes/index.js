const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require('./user');
const voteRouter = require('./vote');
const commentRouter = require('./comment');

router.use('/select', selectRouter);
router.use('/', userRouter);
router.use('/select/vote', voteRouter);
router.use('/comment', commentRouter);
module.exports = router;
