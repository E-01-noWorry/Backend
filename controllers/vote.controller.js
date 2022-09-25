const { Select, User, Vote } = require('../models');
const ErrorCustom = require('../advice/errorCustom');
const admin = require('firebase-admin');
const joi = require('../advice/joiSchema');

const VoteService = require('../services/vote.service');

let count = [0, 0, 0, 0];
function totalcount(data) {
  data.map((e) => {
    if (e.choice === 1) {
      ++count[0];
    } else if (e.choice === 2) {
      ++count[1];
    } else if (e.choice === 3) {
      ++count[2];
    } else if (e.choice === 4) {
      ++count[3];
    }
  });
  let totalcount = count[0] + count[1] + count[2] + count[3];
  return totalcount;
}

class VoteController {
  voteService = new VoteService();

  postVote = async (req, res, next) => {
    try {
      const { userKey } = res.locals.user;
      const { selectKey } = joi.selectKeySchema.validate(req.params).value;
      const { choice } = joi.choiceSchema.validate(req.body).value;

      const postVote = await this.voteService.postVote(
        userKey,
        selectKey,
        choice
      );

      return res.status(200).json({
        ok: true,
        msg: '선택지 투표 성공',
        result: postVote,
      });
    } catch (err) {
      next(err);
    }
  };

  getVote = async (req, res, next) => {
    try {
      const { selectKey } = joi.selectKeySchema.validate(req.params).value;

      const isSelect = await Select.findOne({ where: { selectKey } });

      if (!isSelect) {
        throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
      }

      const datas = await Vote.findAll({
        where: { selectKey },
      });

      count = [0, 0, 0, 0];
      const total = totalcount(datas);

      function rate(i) {
        const num = (count[i] / total) * 100;
        return Math.round(num * 100) / 100;
      }

      // 글이 마감되었는지 확인 마감되면 바로 투표결과 보여줌
      if (isSelect.compeltion === true) {
        return res.status(200).json({
          ok: true,
          msg: '마감된 투표 조회 성공',
          result: {
            1: rate(0),
            2: rate(1),
            3: rate(2),
            4: rate(3),
            total,
          },
        });
      }

      const user = res.locals.user;
      // 미들웨어를 거쳐서 로그인 유무 확인(비로그인시)
      if (!user) {
        return res.status(200).json({
          ok: true,
          msg: '비로그인 상태',
          result: { total },
        });
      } else {
        // 미들웨어를 거쳐서 로그인 유무 확인(로그인시)
        const userKey = user.userKey;

        // 글작성자인지 확인
        if (userKey === isSelect.userKey) {
          return res.status(200).json({
            ok: true,
            msg: '글작성자가 투표 조회 성공',
            result: {
              1: rate(0),
              2: rate(1),
              3: rate(2),
              4: rate(3),
              total,
            },
          });
        }

        const voteCheck = await Vote.findOne({
          where: { selectKey, userKey },
        });

        // 로그인은 했지만, 투표를 안하면 비율 안보이게함
        if (!voteCheck) {
          return res.status(200).json({
            ok: true,
            msg: '참여자가 투표를 하지 않음',
            result: { total },
          });
        } else {
          // 로그인하고 투표까지하면 투표비율 보여줌
          const isVote = await Vote.findOne({
            where: { selectKey, userKey },
            attributes: ['choice'],
          });

          return res.status(200).json({
            ok: true,
            msg: '선택지 비율 조회 성공',
            result: {
              1: rate(0),
              2: rate(1),
              3: rate(2),
              4: rate(3),
              total,
              isVote: isVote.choice,
            },
          });
        }
      }
    } catch (err) {
      next(err);
    }
  };
}

module.exports = VoteController;
