const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require('./user');
const kakaoRouter = require('./kakao');
const googleRouter = require('./google');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const recommentRouter = require('./recomment');
const chatRouter = require('./chat');
const myRouter = require('./mypage');
const tokenRouter = require('./push');
const adviceRouter = require('./advice');

router.use('/select', selectRouter);
router.use('/user', userRouter);
router.use('/auth', kakaoRouter);
router.use('/auth', googleRouter);
router.use('/select/vote', voteRouter);
router.use('/comment', commentRouter);
router.use('/recomment', recommentRouter);
router.use('/room', chatRouter);
router.use('/my', myRouter);
router.use('/token', tokenRouter);
router.use('/advice', adviceRouter);

module.exports = router;
