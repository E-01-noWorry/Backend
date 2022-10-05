const { Select, User, Comment, Recomment } = require('../models');

class CommentRepository {
  findOneSelect = async (selectKey) => {
    const findOneSelect = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['deviceToken'] }],
    });

    return findOneSelect;
  };

  createComment = async (comment, selectKey, userKey) => {
    const createComment = await Comment.create({ comment, selectKey, userKey });

    return createComment;
  };

  findOneComment = async (createComments) => {
    const findOneComment = await Comment.findOne({
      where: { commentKey: createComments.commentKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return findOneComment;
  };

  findAllComments = async (selectKey) => {
    const findAllComments = await Comment.findAll({
      where: { selectKey },
      include: [
        { model: User, attributes: ['nickname', 'point'] },
        {
          model: Recomment,
          include: [{ model: User, attributes: ['nickname', 'point'] }],
        },
      ],
      order: [['commentKey', 'ASC']],
    });

    return findAllComments;
  };

  findOneCmt = async (commentKey) => {
    const findOneCmt = await Comment.findOne({
      where: { commentKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return findOneCmt;
  };

  updateComment = async (comment, commentKey) => {
    const updateComment = await Comment.update(
      { comment },
      { where: { commentKey } }
    );

    return updateComment;
  };

  delComment = async (commentKey, userKey) => {
    const delComment = await Comment.destroy({
      where: { commentKey, userKey },
    });

    return delComment;
  };
}

module.exports = CommentRepository;
