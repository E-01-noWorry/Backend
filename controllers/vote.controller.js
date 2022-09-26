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

      const user = res.locals.user;

      const getVote = await this.voteService.getVote(selectKey, user);

      return res.status(200).json(getVote);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = VoteController;
