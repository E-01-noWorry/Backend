const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require('./user');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const chatRouter = require('./chat');

router.use('/select', selectRouter);
router.use('/', userRouter);
router.use('/select/vote', voteRouter);
router.use('/comment', commentRouter);
router.use('/chat', chatRouter);
module.exports = router;
