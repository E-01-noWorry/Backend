const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');

const CommentController = require('../controllers/comment.controller');
const commentController = new CommentController();

// 댓글 작성
router.post('/:selectKey', authMiddleware, commentController.postComment);

// 댓글 전체 조회
router.get('/:selectKey', commentController.getAllComment);

// 댓글 수정
router.put('/:commentKey', authMiddleware, commentController.putComment);

// 댓글 삭제
router.delete('/:commentKey', authMiddleware, commentController.deleteComment);

module.exports = router;
