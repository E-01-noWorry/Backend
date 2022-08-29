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
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    // 투표했는지 확인
    const voteCheck = await Vote.findOne({
      where: { selectKey, userKey },
    });

    // 안하면 투표 데이터 생성
    if (!voteCheck) {
      await Vote.create({
        selectKey,
        userKey,
        choice,
      });
    } else {
      // 했다면 수정(수정은 원래 예정에 없는건데 일단 만듬)
      await Vote.update(
        { choice },
        {
          where: { selectKey, userKey },
        }
      );
    }

    // 일단은 투표하면 그냥 메세지만 응답하고, 새로 get요청 받을생각
    return res.status(200).json({
      ok: true,
      msg: '선택지 투표 성공',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '선택지 투표 실패.',
    });
  }
});

// 선택지 비율 조회
router.get('/:selectKey', isLoginMiddlware, async (req, res) => {
  try {
    const { selectKey } = req.params;

    const isSelect = await Select.findOne({ where: { selectKey } });

    if (!isSelect) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    const user = res.locals.user;
    // 미들웨어를 거쳐서 로그인 유무 확인(비로그인시)
    if (!user) {
      return res.status(400).json({
        ok: false,
        errMsg: '비로그인 상태',
      });
    } else {
      // 미들웨어를 거쳐서 로그인 유무 확인(로그인시)
      const userKey = user.userKey;

      const voteCheck = await Vote.findOne({
        where: { selectKey, userKey },
      });

      // 로그인은 했지만, 투표를 안하면 비율 안보이게함
      // false로 처리하는게 좋은지 아님 빈값을 주는게 맞는지..
      // 아니면 총 참여자 수만 줄까?
      if (!voteCheck) {
        return res.status(200).json({
          ok: false,
          errMsg: '참여자가 투표를 하지 않음',
        });
      } else {
        // 로그인하고 투표까지하면 투표비율 보여줌
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
        let total = count1 + count2 + count3 + count4;

        const isVote = await Vote.findOne({
          where: { selectKey, userKey },
          attributes: ['choice'],
        });

        return res.status(200).json({
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
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '선택지 비율 조회 실패.',
    });
  }
});
module.exports = router;
