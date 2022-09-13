require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const passport = require('passport');
const ErrorCustom = require('../advice/errorCustom');
const authMiddleware = require('../middlewares/authMiddlware');

//회원가입
router.post('/user/signup', async (req, res, next) => {
  try {
    const { userId, nickname, password, confirm } = req.body;

    const userIdRegEx = /^[A-Za-z0-9]{6,20}$/;
    const nicknameRegEx = /^[가-힣,A-Za-z0-9]{2,10}$/;
    const passwordRegEx = /^[A-Za-z0-9]{6,20}$/;

    if (!userIdRegEx.test(userId)) {
      throw new ErrorCustom(400, '아이디 양식이 맞지 않습니다.');
    }
    if (!nicknameRegEx.test(nickname)) {
      throw new ErrorCustom(400, '닉네임 양식이 맞지 않습니다.');
    }
    if (!passwordRegEx.test(password)) {
      throw new ErrorCustom(400, '패스워드 양식이 맞지 않습니다.');
    }
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

    const token = jwt.sign({ userKey: user.userKey }, process.env.SECRET_KEY, {
      expiresIn: '6h',
    }); //토큰 만료 6시간 설정
    console.log(token, '토큰 확인');

    res.status(200).json({
      token,
      nickname: user.nickname,
      userKey: user.userKey,
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
      (err, user, info) => {
        if (err) return next(err);

        const { userKey, nickname } = user;
        const token = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          { expiresIn: '6h' }
        ); //토큰 만료 6시간 설정

        result = {
          userKey,
          token,
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
      (err, user, info) => {
        if (err) return next(err);

        const { userKey, nickname } = user;
        const token = jwt.sign(
          { userKey: user.userKey },
          process.env.SECRET_KEY,
          { expiresIn: '6h' }
        ); //토큰 만료 6시간 설정

        result = { userKey, token, nickname };
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

//유저 닉네임 수정               //미들웨어 사용하는게 좋아보이는데 바꿀것이 많을까요?
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
