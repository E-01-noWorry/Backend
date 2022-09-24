require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const joi = require('../advice/joiSchema');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const passport = require('passport');
const ErrorCustom = require('../advice/errorCustom');
const authMiddleware = require('../middlewares/authMiddlware');

//회원가입
router.post('/user/signup', async (req, res, next) => {
  try {
    const result = joi.userSchema.validate(req.body);
    if (result.error) {
      throw new ErrorCustom(400, '형식에 맞게 모두 입력해주세요');
    }
    const { userId, nickname, password, confirm } = result.value;

    if (password !== confirm) {
      throw new ErrorCustom(400, '패스워드가 일치하지 않습니다.');
    }

    const exitUsers = await User.findAll({
      where: { [Op.or]: { userId } },
    });
    if (exitUsers.length) {
      throw new ErrorCustom(400, '이미 사용중인 아이디입니다.');
    }

    const salt = await bcrypt.genSalt(10); //기본이 10, 숫자가 높을 수록 연산 시간과 보안이 높아짐.
    pwHash = await bcrypt.hash(password, salt);
    await User.create({ userId, nickname, password: pwHash, point: 0 });

    res.status(201).json({ msg: '회원가입에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
});

//로그인
router.post('/user/login', async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ where: { userId } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new ErrorCustom(400, '아이디 또는 패스워드가 잘못되었습니다.');
    }

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
    console.log(accessToken, 'access토큰 확인');
    console.log(refreshToken, 'refresh토큰 확인');

    await user.update({ refreshToken }, { where: { userKey: user.userKey } });

    res.status(200).json({
      nickname: user.nickname,
      userKey: user.userKey,
      accessToken,
      refreshToken,
      msg: '로그인에 성공하였습니다.',
    });
  } catch (error) {
    next(error);
  }
});

//카카오로그인
const kakaoCallback = (req, res, next) => {
  try {
    passport.authenticate(
      'kakao',
      { failureRedirect: '/user/login' }, //실패하면 '/user/login''로 돌아감.
      async (err, user, info) => {
        if (err) return next(err);

        const { userKey, nickname } = user;

        const accessToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          {
            expiresIn: '30s',
          }
        );
        const refreshToken = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          {
            expiresIn: '45s',
          }
        );

        await User.update({ refreshToken }, { where: { userKey: user.userKey } });

        result = {
          userKey,
          accessToken,
          refreshToken,
          nickname,
        };
        res
          .status(201)
          .json({ user: result, msg: '카카오 로그인에 성공하였습니다.' });
      }
    )(req, res, next);
  } catch (error) {
    next(error);
  }
};

//로그인페이지로 이동
router.get('/auth/kakao', passport.authenticate('kakao'));
//카카오에서 설정한 redicrect url을 통해 요청 재전달
router.get('/auth/kakao/callback', kakaoCallback);

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

        await User.update({ refreshToken }, { where: { userKey: user.userKey } });

        result = { userKey, accessToken, refreshToken : updateRefresh.refreshToken, nickname };
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
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
); //프로필과 이메일 정보를 받음.
//구글 서버 로그인이 되면, redicrect url을 통해 요청 재전달
router.get('/auth/google/callback', googleCallback);

//로그인 유저 확인
router.get('/user/me', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname, userId } = res.locals.user;
    const { accessToken } = res.locals;

    const existUser = await User.findOne({ where: { userKey } });
    // console.log(existUser, '유저확인');
    res.status(200).json({
      ok: true,
      msg: '로그인 유저 정보 확인',
      accessToken,
      refreshToken: existUser.refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// 유저 닉네임 수정
router.put('/user/:userKey', async (req, res) => {
  try {
    const { userKey } = req.params;

    const { nickname } = req.body;

    await User.update({ nickname }, { where: { userKey } });
    return res
      .status(201)
      .json({ userKey, nickname, msg: '닉네임 변경이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
