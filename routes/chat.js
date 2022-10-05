const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const isLoginMiddlware = require('../middlewares/isLoginMiddlware');

const ChatController = require('../controllers/chat.controller');
const chatController = new ChatController();

// 채팅방 생성
router.post('/', authMiddleware, chatController.postChat);

// 채팅방 검색
router.get('/search', chatController.searchChat);

// 채팅방 전체 조회
router.get('/', isLoginMiddlware, chatController.allChat);

// 채팅방 입장
router.post('/:roomKey', authMiddleware, chatController.entranceChat);

// 채팅방 나가기
router.delete('/:roomKey', authMiddleware, chatController.leaveChat);

// 채팅방 상세조회(채팅방 정보, 참여 유저들 정보 보여주기)
router.get('/:roomKey', authMiddleware, chatController.detailChat);

module.exports = router;
