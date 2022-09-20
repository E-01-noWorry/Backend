const express = require('express');
const router = express.Router();
const { Select, User, Vote, Room, Participant } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');

// 마이페이지 포인트 조회
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const user = await User.findOne({ where: { userKey } });

    return res.status(200).json({
      ok: true,
      msg: '마이페이지 조회 성공',
      result: { point: user.point },
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

    const allSelect = await Select.findAll({
      where: { userKey },
      include: [{ model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    let now = new Date();
    now = now.setHours(now.getHours() + 9);

    res.status(200).json({
      msg: '내가 작성한 선택글 조회 성공',
      result: allSelect.map((e) => {
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

    const allVote = await Vote.findAll({
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

    let now = new Date();
    now = now.setHours(now.getHours() + 9);

    res.status(200).json({
      msg: '내가 투표한 선택글 조회 성공',
      result: allVote.map((e) => {
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

    const allRoom = await Room.findAll({
      where: { userKey },
      include: [{ model: Participant, attributes: ['userKey'] }],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      ok: true,
      msg: '내가 만든 채팅방 조회 성공',
      result: allRoom.map((e) => {
        return {
          roomKey: e.roomKey,
          title: e.title,
          max: e.max,
          currentPeople: e.Participants.length,
          hashTag: e.hashTag,
          host: nickname,
          userKey: e.userKey,
        };
      }),
    });
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

    const allEnter = await Participant.findAll({
      where: { userKey },
      include: [
        {
          model: Room,
          include: [
            { model: User, attributes: ['nickname'] },
            { model: Participant },
          ],
        },
      ],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      ok: true,
      msg: '내가 들어가있는 채팅방 조회 성공',
      result: allEnter.map((e) => {
        return {
          roomKey: e.Room.roomKey,
          title: e.Room.title,
          max: e.Room.max,
          currentPeople: e.Room.Participants.length,
          hashTag: e.Room.hashTag,
          host: e.Room.User.nickname,
          userKey: e.Room.userKey,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
