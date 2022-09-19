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
      'dS4qc2yHFas:APA91bGVpW3PYrF5_X4gAx7nFYq1G0vPzrjl1kj87A9J-aipdIO1XSniB73JQDFZur8ybWos_v5tT2JDsKfu6gG0oXAM7YZz-K4I4e3uk1sF_Y7Ea3RHT_e9aY1boHSbU8CCBtPai5II'; // 크롬
    // 'c5s2m7Mf4Zk:APA91bEfxFDvDUeyLmsyaLwGbF49lzmpG0a7IulSl7el5-4itV7yy5dbWuTYmA5OzpNpN0N-xgVmIwQzYy21tIgDL377wWjD4lGS_TzOk1ody93HIFvn11m9a1XKGJ-svtFWqeQJE5Zf'; // 엣지

    let message = {
      notification: {
        title: '테스트 데이터 발송',
        body: '데이터가 잘 가나요?',
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
