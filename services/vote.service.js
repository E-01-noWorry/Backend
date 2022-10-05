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

const VoteRepository = require('../repositories/vote.repository');

class VoteService {
  voteRepository = new VoteRepository();

  postVote = async (userKey, selectKey, choice) => {
    const isSelect = await this.voteRepository.findOneSelect(selectKey);

    if (!isSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    if (userKey === isSelect.userKey) {
      throw new ErrorCustom(400, '본인 글에는 투표할 수 없습니다.');
    }

    if (isSelect.completion === true) {
      throw new ErrorCustom(400, '투표가 마감되었습니다.');
    }

    const voteCheck = await this.voteRepository.findOneVote(selectKey, userKey);

    if (!voteCheck) {
      await this.voteRepository.createVote(selectKey, userKey, choice);

      let votePoint = await this.voteRepository.incrementPoint(userKey);

      const allVotes = await this.voteRepository.findAllVote(selectKey);

      const total = totalcount(allVotes);

      function rate(i) {
        const num = (count[i] / total) * 100;
        return Math.round(num * 100) / 100;
      }

      if (total % 5 === 0) {
        if (isSelect.User.deviceToken) {
          let target_token = isSelect.User.deviceToken;

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
      }

      return {
        1: rate(0),
        2: rate(1),
        3: rate(2),
        4: rate(3),
        total,
        isVote: choice,
        votePoint: votePoint.point,
      };
    } else {
      throw new ErrorCustom(400, '이미 투표를 실시했습니다.');
    }
  };

  getVote = async (selectKey, user) => {
    const isSelect = await this.voteRepository.findOneSelect(selectKey);

    if (!isSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const datas = await this.voteRepository.findAllVote(selectKey);

    count = [0, 0, 0, 0];
    const total = totalcount(datas);

    function rate(i) {
      const num = (count[i] / total) * 100;
      return Math.round(num * 100) / 100;
    }

    // 글 마감 확인, 마감시 결과 전달
    if (isSelect.completion === true) {
      return {
        ok: true,
        msg: '마감된 투표 조회 성공',
        result: {
          1: rate(0),
          2: rate(1),
          3: rate(2),
          4: rate(3),
          total,
        },
      };
    }

    // 로그인 유무 확인(비로그인)
    if (!user) {
      return {
        ok: true,
        msg: '비로그인 상태',
        result: { total },
      };
    } else {
      // 로그인 유무 확인(로그인시)
      const userKey = user.userKey;

      // 글작성자 확인
      if (userKey === isSelect.userKey) {
        return {
          ok: true,
          msg: '글작성자가 투표 조회 성공',
          result: {
            1: rate(0),
            2: rate(1),
            3: rate(2),
            4: rate(3),
            total,
          },
        };
      }

      const voteCheck = await this.voteRepository.findOneVote(
        selectKey,
        userKey
      );

      // 미 투표시 결과 미전달
      if (!voteCheck) {
        return {
          ok: true,
          msg: '참여자가 투표를 하지 않음',
          result: { total },
        };
      } else {
        // 투표시 결과 전달
        const isVote = await this.voteRepository.findOneVote(
          selectKey,
          userKey
        );

        return {
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
        };
      }
    }
  };
}

module.exports = VoteService;
