const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require('./user');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const recommentRouter = require('./recomment');
const chatRouter = require('./chat');
const myRouter = require('./mypage');
const tokenRouter = require('./push');

router.use('/select', selectRouter);
router.use('/', userRouter);
router.use('/select/vote', voteRouter);
router.use('/comment', commentRouter);
router.use('/recomment', recommentRouter);
router.use('/room', chatRouter);
router.use('/my', myRouter);
router.use('/token', tokenRouter);

module.exports = router;
