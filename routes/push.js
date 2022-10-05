const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const admin = require('firebase-admin');
let serAccount = require('../config/firebase');

admin.initializeApp({
  credential: admin.credential.cert(serAccount),
});

// 디바이스 토큰 저장
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

module.exports = router;
