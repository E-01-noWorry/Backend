const express = require('express');
const router = express.Router();
const { Select, User } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
// const { Op } = require('sequelize');

// 선택글 작성
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { title, category, content, image, time, options } = req.body;

    if (
      title === '' ||
      category === '' ||
      content === '' ||
      image === '' ||
      time === '' ||
      options === ''
    ) {
      return res.status(400).json({
        ok: false,
        errMsg: '항목들을 모두 입력해주세요.',
      });
    }

    // 마감시간 계산 (db 저장할때 한국시간과 기본적으로 9시간 차이나서 +9를 해줌 +time은 사용자가 지정한 시간)
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

    return res.status(200).json({
      ok: true,
      msg: '선택글 작성 성공',
      result: {
        selectKey: data.selectKey,
        title: data.title,
        category: data.category,
        deadLine: data.deadLine,
        completion: data.completion,
        nickname: nickname,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '선택글 작성 실패.',
    });
  }
});

// 선택글 모두 조회
router.get('/', async (req, res) => {
  try {
    const datas = await Select.findAll({
      include: [{ model: User, attributes: ['nickname'] }],
      order: [['selectKey', 'DESC']],
    });

    return res.status(200).json({
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
    return res.status(500).json({
      ok: false,
      errMsg: '선택글 모두 조회 실패.',
    });
  }
});

// 선택글 상세조회
router.get('/:selectKey', async (req, res) => {
  try {
    const { selectKey } = req.params;
    const data = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname'] }],
    });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    return res.status(200).json({
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
        userKey: data.userKey,
        nickname: data.User.nickname,
        finalChoice: data.finalChoice,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '선택글 상세조회 실패.',
    });
  }
});

// 선택글 삭제
router.delete('/:selectKey', authMiddleware, async (req, res) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { selectKey } = req.params;
    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    if (userKey !== data.userKey) {
      return res.status(400).json({
        ok: false,
        errMsg: '작성자가 일치하지 않음',
      });
    }

    await Select.destroy({ where: { selectKey } });

    return res.status(200).json({
      ok: true,
      msg: '선택글 삭제 성공',
      result: {
        selectKey: data.selectKey,
        title: data.title,
        category: data.category,
        deadLine: data.deadLine,
        completion: data.completion,
        nickname: nickname,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '선택글 삭제 실패.',
    });
  }
});

module.exports = router;
