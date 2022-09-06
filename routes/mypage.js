const express = require('express');
const router = express.Router();
const { Select, User, Vote } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');

// 마이페이지 포인트 조회
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const user = await User.findOne({ where: { userKey } });
    // 나중에 포인트 db만들면 그것만 가져와서 보여주기

    return res.status(200).json({
      ok: true,
      msg: '마이페이지 조회 성공',
      result: { point: 0 },
    });
  } catch (err) {
    next(err);
  }
});

// 내가 작성한 선택글 조회
router.get('/select', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const pageNum = req.query.page;

    let offset = 0;
    const limit = 5;
    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }

    const datas = await Select.findAll({
      where: { userKey },
      include: [{ model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    const now = new Date();

    res.status(200).json({
      msg: '내가 작성한 선택글 조회 성공',
      result: datas.map((e) => {
        return {
          selectKey: e.selectKey,
          title: e.title,
          category: e.category,
          deadLine: e.deadLine,
          completion: now > new Date(e.deadLine),
          nickname: nickname,
          options: e.options,
          total: e.Votes.length,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// 내가 투표한 선택글 조회
router.get('/vote', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const pageNum = req.query.page;

    let offset = 0;
    const limit = 5;
    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }

    const datas = await Vote.findAll({
      where: { userKey },
      include: [
        {
          model: Select,
          include: [
            { model: User, attributes: ['nickname'] },
            { model: Vote, attributes: ['choice'] },
          ],
        },
      ],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    const now = new Date();

    res.status(200).json({
      msg: '내가 투표한 선택글 조회 성공',
      result: datas.map((e) => {
        return {
          selectKey: e.Select.selectKey,
          title: e.Select.title,
          category: e.Select.category,
          deadLine: e.Select.deadLine,
          completion: now > new Date(e.Select.deadLine),
          nickname: e.Select.User.nickname,
          options: e.Select.options,
          total: e.Select.Votes.length,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// 내가 만든 채팅방 조회
router.get('/room', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const pageNum = req.query.page;

    let offset = 0;
    const limit = 5;
    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }
  } catch (err) {
    next(err);
  }
});

// 내가 들어가있는 채팅방 조회
router.get('/enter', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const pageNum = req.query.page;

    let offset = 0;
    const limit = 5;
    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
