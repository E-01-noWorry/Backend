const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const isLoginMiddlware = require('../middlewares/isLoginMiddlware');

const VoteController = require('../controllers/vote.controller');
const voteController = new VoteController();

// 선택지 투표
router.post('/:selectKey', authMiddleware, voteController.postVote);

// 선택지 비율 조회
router.get('/:selectKey', isLoginMiddlware, voteController.getVote);

module.exports = router;
