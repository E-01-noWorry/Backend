const express = require('express');
const router = express.Router();
const { Select, User, Vote } = require('../models');
const AuthMiddleware = require('../middlewares/authMiddlware');
const isLoginMiddlware = require('../middlewares/isLoginMiddlware');
const { Op } = require('sequelize');

// 선택지 투표
router.post('/:selectKey', AuthMiddleware, async (req, res) => {
  try {
    const { userKey } = res.locals.user;
    const { selectKey } = req.params;
    const { choice } = req.body;

    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
      return;
    }

    const voteCheck = await Vote.findOne({
      where: { selectKey, userKey },
    });

    if (!voteCheck) {
      await Vote.create({
        selectKey,
        userKey,
        choice,
      });
    } else {
      await Vote.update(
        { choice },
        {
          where: { selectKey, userKey },
        }
      );
    }

    res.status(200).json({
      ok: true,
      msg: '선택지 투표 성공',
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      errMsg: '선택지 투표 실패.',
    });
    return;
  }
});

// 선택지 비율 조회
router.get('/:selectKey', async (req, res) => {
  try {
    const { selectKey } = req.params;

    const isSelect = await Select.findOne({ where: { selectKey } });

    if (!isSelect) {
      res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
      return;
    }

    // const user = res.locals.user;
    // console.log('잉?' + user.userKey);
    // if (!user) {
    //   res.status(400).json({
    //     ok: false,
    //     errMsg: '비로그인 사람임',
    //   });
    //   return;
    // }

    // const userKey = user.userKey;
    const userKey = 22;

    const voteCheck = await Vote.findOne({
      where: { selectKey, userKey },
    });

    // false로 처리하는게 좋은지 아님 빈값을 주는게 맞는지..
    // 아니면 총 참여자 수만 줄까?
    if (!voteCheck) {
      res.status(400).json({
        ok: false,
        errMsg: '참여자가 투표를 하지 않음',
      });
      return;
    }

    const datas = await Vote.findAll({
      where: { selectKey },
    });

    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let count4 = 0;
    datas.map((e) => {
      if (e.choice === 1) {
        ++count1;
      } else if (e.choice === 2) {
        ++count2;
      } else if (e.choice === 3) {
        ++count3;
      } else if (e.choice === 4) {
        ++count4;
      }
    });
    console.log(count1, count2, count3, count4);
    let total = count1 + count2 + count3 + count4;

    const isVote = await Vote.findOne({
      where: { selectKey, userKey },
      attributes: ['choice'],
    });

    res.status(200).json({
      ok: true,
      msg: '선택지 비율 조회 성공',
      result: {
        1: (Math.round((count1 / total) * 100) / 100) * 100,
        2: (Math.round((count2 / total) * 100) / 100) * 100,
        3: (Math.round((count3 / total) * 100) / 100) * 100,
        4: (Math.round((count4 / total) * 100) / 100) * 100,
        total,
        isVote: isVote.choice,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      ok: false,
      errMsg: '선택지 비율 조회 실패.',
    });
    return;
  }
});
module.exports = router;
