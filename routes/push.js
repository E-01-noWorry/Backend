const admin = require('firebase-admin');
let serAccount = require('../config/firebase');

admin.initializeApp({
  credential: admin.credential.cert(serAccount),
});

const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');

// 토큰 받아와서 저장
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { userKey } = res.locals.user;
    const { deviceToken } = req.body;

    await User.update({ deviceToken }, { where: { userKey } });

    return res.status(200).json({
      ok: true,
      msg: '토큰 저장 성공',
    });
  } catch (err) {
    next(err);
  }
});

// 푸시 알림 보내기 임시
router.get('/push', async (req, res, next) => {
  try {
    let target_token = '';

    let message = {
      notification: {
        title: '테스트 데이터 발송',
        body: '데이터가 잘 가나요?',
      },
      token: target_token,
      data: {
        title: '포그라운드 알림',
        body: '포그라운드 내용',
      },
    };
    console.log(message);

    admin
      .messaging()
      .send(message)
      .then(function (response) {
        console.log('Successfully sent message: : ', response);
      })
      .catch(function (err) {
        console.log('Error Sending message!!! : ', err);
      });

    // res.status(200).json({ ok: token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
