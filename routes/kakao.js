const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');

// 카카오로그인
const kakaoCallback = (req, res, next) => {
  try {
    passport.authenticate(
      'kakao',
      { failureRedirect: '/user/login' }, // 실패하면 '/user/login''로 돌아감.
      async (err, user, info) => {
        if (err) return next(err);

        const { userKey, nickname } = user;

        const accessToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          { expiresIn: '3h' }
        );
        const refreshToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          { expiresIn: '5h' }
        );

        await User.update(
          { refreshToken },
          { where: { userKey: user.userKey } }
        );

        result = { userKey, accessToken, refreshToken, nickname };
        res.status(201).json({
          user: result,
          msg: '카카오 로그인에 성공하였습니다.',
        });
      }
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};

// 로그인페이지로 이동
router.get('/kakao', passport.authenticate('kakao'));
// 카카오에서 설정한 redicrect url을 통해 요청 재전달
router.get('/kakao/callback', kakaoCallback);

module.exports = router;
