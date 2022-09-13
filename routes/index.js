const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require('./user');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const recommentRouter = require('./recomment');
const chatRouter = require('./chat');
const myRouter = require('./mypage');

router.use('/select', selectRouter);
router.use('/', userRouter);
router.use('/select/vote', voteRouter);
router.use('/comment', commentRouter);
router.use('/recomment', recommentRouter);
router.use('/room', chatRouter);
router.use('/my', myRouter);

module.exports = router;
