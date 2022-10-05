const joi = require('../advice/joiSchema');

const VoteService = require('../services/vote.service');

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
      const user = res.locals.user;
      const { selectKey } = joi.selectKeySchema.validate(req.params).value;

      const getVote = await this.voteService.getVote(selectKey, user);

      return res.status(200).json(getVote);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = VoteController;
