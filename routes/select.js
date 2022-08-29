const express = require('express');
const router = express.Router();
const { Select, User } = require('../models');
// const AuthMiddleware = require("../middlewares/auth_middlewares");
// const VerifyMiddleware = require("../middlewares/verify_middlewares");
const { Op } = require('sequelize');

// 선택글 작성
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
    const date = new Date();
    const deadLine = date.setHours(date.getHours() + 9 + time);

    const data = await Select.create({
      title,
      category,
      content,
      image,
      deadLine,
      options,
      userKey,
      completion: false,
      finalChoice: 0,
    });

    const nick = await User.findOne({
      where: { userKey },
      attribute: ['nickname'],
    });

    res.status(200).json({
      ok: true,
      msg: '선택글 작성 성공',
      result: {
        selectKey: data.selectKey,
        title: data.title,
        category: data.category,
        deadLine: data.deadLine,
        completion: data.completion,
        nickname: nick.nickname,
      },
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

// 선택글 모두 조회
router.get('/', async (req, res) => {
  try {
    const datas = await Select.findAll({
      include: [{ model: User, attribute: ['nickname'] }],
      order: [['selectKey', 'DESC']],
    });

    res.status(200).json({
      ok: true,
      msg: '선택글 모두조회 성공',
      result: datas.map((e) => {
        return {
          selectKey: e.selectKey,
          title: e.title,
          category: e.category,
          deadLine: e.deadLine,
          completion: e.completion,
          nickname: e.User.nickname,
        };
      }),
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      ok: false,
      errMsg: '선택글 모두 조회 실패.',
    });
    return;
  }
});

// 선택글 상세조회
router.get('/:selectKey', async (req, res) => {
  try {
    const { selectKey } = req.params;
    const data = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attribute: ['nickname'] }],
    });

    if (!data) {
      res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      msg: '선택글 상세조회 성공',
      result: {
        selectKey: data.selectKey,
        title: data.title,
        category: data.category,
        content: data.content,
        image: data.image,
        deadLine: data.deadLine,
        options: data.options,
        completion: data.completion,
        nickname: data.User.nickname,
        finalChoice: data.finalChoice,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      ok: false,
      errMsg: '선택글 모두 조회 실패.',
    });
    return;
  }
});

module.exports = router;
