const express = require('express');
const router = express.Router();
const { User, Comment, Recomment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');
const admin = require('firebase-admin');
const joi = require('../advice/joiSchema');

const RecommentController = require('../controllers/recomment.controller');
const recommentController = new RecommentController();

// 대댓글 작성
router.post('/:commentKey', authMiddleware, recommentController.postRecomment);

//대댓글 수정
router.put('/:recommentKey', authMiddleware, recommentController.putRecomment);

// 대댓글 삭제
router.delete('/:recommentKey', authMiddleware, recommentController.deleteRecomment);

module.exports = router;
