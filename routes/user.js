require('dotenv').config();
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');

const UserController = require('../controllers/user.controller');
const userController = new UserController();

//회원가입
router.post('/signup', userController.postSignup);

//로그인
router.post('/login', userController.userLogin);

//로그인 유저 확인
router.get('/me', authMiddleware, userController.confirmUser);

// 유저 닉네임 수정
router.put('/:userKey', authMiddleware, userController.changeNickname);

//회원탈퇴
router.delete('/:userKey', authMiddleware, userController.deleteUser);

module.exports = router;
