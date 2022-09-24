const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');

const MypageController = require('../controllers/mypage.controller');
const mypageController = new MypageController();

// 마이페이지 포인트 조회
router.get('/', authMiddleware, mypageController.getMypage);

// 내가 작성한 선택글 조회
router.get('/select', authMiddleware, mypageController.getMySelect);

// 내가 투표한 선택글 조회
router.get('/vote', authMiddleware, mypageController.getIsVote);

// 내가 만든 채팅방 조회
router.get('/room', authMiddleware, mypageController.getMyRoom);

// 내가 들어가있는 채팅방 조회
router.get('/enter', authMiddleware, mypageController.getEnterRoom);

module.exports = router;
