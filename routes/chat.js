const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const isLoginMiddlware = require('../middlewares/isLoginMiddlware');

const ChatController = require('../controllers/chat.controller');
const chatController = new ChatController();

// 채팅방 생성
router.post('/', authMiddleware, chatController.postChat);

// 채팅방 검색은 title, hashtag 정보 둘 중하나라도 있으면 검색된다
router.get('/search', chatController.searchChat);

// 채팅방 전체 조회
router.get('/', isLoginMiddlware, chatController.allChat);

// 채팅방 입장
// 호스트 유저는 방만들때 Participant에 생성했음
router.post('/:roomKey', authMiddleware, chatController.entranceChat);

// 채팅방 나가기
// 나가는 유저가 호스트면 채팅방,채팅내용 삭제하고
// 일반유저면 참가자 명단에서만 삭제
router.delete('/:roomKey', authMiddleware, chatController.leaveChat);

// 채팅방 상세조회(채팅방 정보, 참여 유저들 정보 보여주기)
router.get('/:roomKey', authMiddleware, chatController.detailChat);

module.exports = router;
