const { Select, User, Vote } = require('../models');
const ErrorCustom = require('../advice/errorCustom');
const admin = require('firebase-admin');

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
  postVote = async (req, res, next) => {
    try {
      const { userKey } = res.locals.user;
      const { selectKey } = req.params;
      const { choice } = req.body;

      const data = await Select.findOne({
        where: { selectKey },
        include: [{ model: User, attributes: ['deviceToken'] }],
      });

      if (!data) {
        throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
      }

      if (userKey === data.userKey) {
        throw new ErrorCustom(400, '본인 글에는 투표할 수 없습니다.');
      }

      if (data.compeltion === true) {
        throw new ErrorCustom(400, '투표가 마감되었습니다.');
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

        const datas = await Vote.findAll({
          where: { selectKey },
        });

        // count = [0, 0, 0, 0];
        const total = totalcount(datas);

        function rate(i) {
          const num = (count[i] / total) * 100;
          return Math.round(num * 100) / 100;
        }

        //선택글 투표시 +1점씩 포인트 지급
        let votePoint = await User.findOne({ where: { userKey } });
        await votePoint.update({ point: votePoint.point + 1 });

        // 투표가 3개씩 될때 알림 보냄
        if (total % 3 === 0) {
          let target_token = data.User.deviceToken;

          const message = {
            token: target_token,
            data: {
              title: '곰곰',
              body: `게시물에 ${total}개 투표가 진행중입니다.`,
              link: `detail/${selectKey}`,
            },
          };

          admin
            .messaging()
            .send(message)
            .catch(function (err) {
              next(err);
            });
        }

        return res.status(200).json({
          ok: true,
          msg: '선택지 투표 성공',
          result: {
            1: rate(0),
            2: rate(1),
            3: rate(2),
            4: rate(3),
            total,
            isVote: choice,
            votePoint: votePoint.point,
          },
        });
      } else {
        throw new ErrorCustom(400, '이미 투표를 실시했습니다.');
      }
    } catch (err) {
      next(err);
    }
  };
}

module.exports = VoteController;
