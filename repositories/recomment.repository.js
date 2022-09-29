const { User, Comment, Recomment } = require('../models');

class RecommentRepository {
  findOneComment = async (commentKey) => {
    const findOneComment = await Comment.findOne({
      where: { commentKey },
      include: [{ model: User, attributes: ['deviceToken'] }],
    });
    return findOneComment;
  };

  createRecomment = async (commentKey, comment, userKey) => {
    const createRecomment = await Recomment.create({
      commentKey,
      comment,
      userKey,
    });

    return createRecomment;
  };

  findRecomment = async (createRecomment) => {
    const findRecomment = await Recomment.findOne({
      where: { recommentKey: createRecomment.recommentKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return findRecomment;
  };

  findOneRecomment = async (recommentKey) => {
    const findOneRecomment = await Recomment.findOne({
      where: { recommentKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return findOneRecomment;
  };

  updateRecomment = async (comment, recommentKey) => {
    const updateRecomment = await Recomment.update(
      { comment },
      {
        where: { recommentKey },
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      }
    );

    return updateRecomment;
  };

  delRecomment = async (recommentKey) => {
    const delRecomment = await Recomment.destroy({
      where: { recommentKey },
    });

    return delRecomment;
  };
}

module.exports = RecommentRepository;
