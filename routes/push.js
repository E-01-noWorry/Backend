const admin = require('firebase-admin');

let serAccount = require('../config/gomgom-5f801-firebase-adminsdk-qxfxg-50e5c1bebf.json');

admin.initializeApp({
  credential: admin.credential.cert(serAccount),
});

const express = require('express');
const router = express.Router();

router.get('/push', async (req, res, next) => {
  try {
    let target_token =
      'c5s2m7Mf4Zk:APA91bEfxFDvDUeyLmsyaLwGbF49lzmpG0a7IulSl7el5-4itV7yy5dbWuTYmA5OzpNpN0N-xgVmIwQzYy21tIgDL377wWjD4lGS_TzOk1ody93HIFvn11m9a1XKGJ-svtFWqeQJE5Zf';

    let message = {
      data: {
        title: '테스트 데이터 발송',
        body: '데이터가 잘 가나요?',
        style: '굳굳',
      },
      token: target_token,
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
