const ErrorCustom = require('../advice/errorCustom');
const joi = require('../advice/joiSchema');

const RecommentService = require('../services/recomment.service');

class RecommentController {
  recommentService = new RecommentService();

  postRecomment = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { commentKey } = joi.commentKeySchema.validate(req.params).value;
      const result = joi.recommentSchema.validate(req.body);

      if (result.error) {
        throw new ErrorCustom(400, '대댓글을 입력해주세요.');
      }
      const { comment } = result.value;

      const createRecomment = await this.recommentService.createRecomment(
        userKey,
        commentKey,
        comment,
        nickname
      );

      res.status(201).json(createRecomment);
    } catch (err) {
      next(err);
    }
  };

  putRecomment = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { recommentKey } = joi.recommentKeySchema.validate(
        req.params
      ).value;
      const result = joi.recommentSchema.validate(req.body);

      if (result.error) {
        throw new ErrorCustom(
          400,
          '대댓글을 입력해주세요. 50자까지 가능합니다.'
        );
      }
      const { comment } = result.value;

      const putRecomment = await this.recommentService.putRecomment(
        userKey,
        recommentKey,
        comment,
        nickname
      );

      res.status(201).json(putRecomment);
    } catch (err) {
      next(err);
    }
  };

  deleteRecomment = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { recommentKey } = joi.recommentKeySchema.validate(
        req.params
      ).value;

      const deleteRecomment = await this.recommentService.deleteRecomment(
        userKey,
        recommentKey,
        nickname
      );

      res.status(201).json(deleteRecomment);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = RecommentController;
