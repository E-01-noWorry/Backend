const express = require('express');
const router = express.Router();
const { Select, User } = require('../models');
// const AuthMiddleware = require("../middlewares/auth_middlewares");
// const VerifyMiddleware = require("../middlewares/verify_middlewares");
const { Op } = require('sequelize');

router.post('/', async (req, res) => {
  try {
    const { title, category, content, image, time, options, userKey } =
      req.body;

    if (
      title === '' ||
      category === '' ||
      content === '' ||
      image === '' ||
      time === '' ||
      options === ''
    ) {
      res.status(400).json({
        ok: false,
        errMsg: '항목들을 모두 입력해주세요.',
      });
      return;
    }
    const deadLine = Date();
    console.log(deadLine);

    // const data = await Select.create({
    //   title,
    //   category,
    //   content,
    //   image,
    //   time,
    //   options,
    //   userKey,
    // });

    res.status(200).json({
      ok: true,
      msg: '선택글 작성 성공',
      // result:
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      ok: false,
      errMsg: '선택글 작성 실패.',
    });
    return;
  }
});

module.exports = router;
