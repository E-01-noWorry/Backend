const express = require('express');
const router = express.Router();
const { Select, User, Vote } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
// const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');

// 선택글 작성
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { title, category, image, time, options } = req.body;

    if (
      title === '' ||
      category === '' ||
      image === '' ||
      time === '' ||
      options === ''
    ) {
      throw new ErrorCustom(400, '항목들을 모두 입력해주세요.');
    }

    // 마감시간 계산 (db 저장할때 한국시간과 기본적으로 9시간 차이나서 +9를 해줌 +time은 사용자가 지정한 시간)
    const date = new Date();
    const deadLine = date.setHours(date.getHours() + 9 + time);
    // const deadLine = date.setMinutes(date.getMinutes() + 540 + time);

    const data = await Select.create({
      title,
      category,
      content: null,
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
    next(err);
  }
});

// 선택글 모두 조회
router.get('/', async (req, res, next) => {
  try {
    const datas = await Select.findAll({
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
    });
    // console.log(datas[0].Votes.length);

    return res.status(200).json({
      ok: true,
      msg: '선택글 모두 조회 성공',
      result: datas.map((e) => {
        return {
          selectKey: e.selectKey,
          title: e.title,
          category: e.category,
          deadLine: e.deadLine,
          completion: e.completion,
          nickname: e.User.nickname,
          options: e.options,
          total: e.Votes.length,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// 선택글 상세조회
router.get('/:selectKey', async (req, res, next) => {
  try {
    const { selectKey } = req.params;
    const data = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname'] }],
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    return res.status(200).json({
      ok: true,
      msg: '선택글 상세 조회 성공',
      result: {
        selectKey: data.selectKey,
        title: data.title,
        category: data.category,
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
    next(err);
  }
});

// 선택글 삭제
router.delete('/:selectKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { selectKey } = req.params;
    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 일치하지 않습니다.');
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
    next(err);
  }
});

// 선택글 모두 조회(무한 스크롤 offset-ver)
router.get('/select/?page=1', async (req, res, next) => {
  try {
    let offset = 0;
    const limit = 5;
    const pageNum = req.query.page;

    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }

    const datas = await Select.findAll({
      include: [{ model: User, attributes: ['nickname'] }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      ok: true,
      msg: '선택글 모두 조회 성공',
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
    next(err);
  }
});

module.exports = router;
