const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

//구글로그인
const googleCallback = (req, res, next) => {
  try {
    passport.authenticate(
      'google',
      { failureRedirect: '/user/login' }, //실패하면 '/user/login''로 돌아감.
      async (err, user, info) => {
        if (err) return next(err);

        const { userKey, nickname } = user;

        const accessToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          {
            expiresIn: '3h',
          }
        );
        const refreshToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          {
            expiresIn: '5h',
          }
        );

        await User.update(
          { refreshToken },
          { where: { userKey: user.userKey } }
        );

        result = { userKey, accessToken, refreshToken, nickname };
        res
          .status(201)
          .json({ user: result, msg: '구글 로그인에 성공하였습니다.' });
      }
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};

//로그인페이지로 이동
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
); //프로필과 이메일 정보를 받음.
//구글 서버 로그인이 되면, redicrect url을 통해 요청 재전달
router.get('/google/callback', googleCallback);

module.exports = router;
