const express = require('express');
const router = express.Router();
const { Select, User, Comment, Recomment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');

// 댓글 작성
router.post('/:selectKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { selectKey } = req.params;
    const { comment } = req.body;

    if (comment === '') {
      throw new ErrorCustom(400, '댓글을 입력해주세요.');
    }
    // if (comment.length > 200) {
    // throw new ErrorCustom(400, '댓글은 200자 이내로 작성 가능합니다.');
    // }

    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const newComment = await Comment.create({
      comment,
      selectKey,
      userKey,
    });
    newComment.updatedAt = newComment.updatedAt.setHours(
      newComment.updatedAt.getHours() + 9
    );

    return res.status(200).json({
      ok: true,
      msg: '댓글 작성 성공',
      result: {
        commentKey: newComment.commentKey,
        comment: newComment.comment,
        nickname: nickname,
        userKey,
        time: newComment.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 해당 게시물 댓글 모두 조회
router.get('/:selectKey', async (req, res, next) => {
  try {
    let offset = 0;
    const limit = 5;
    const pageNum = req.query.page;
    console.log(pageNum);

    if (pageNum > 1) {
      offset = limit * (pageNum - 1); //5 10
    }

    const { selectKey } = req.params;

    const data = await Select.findOne({
      where: { selectKey },
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const datas = await Comment.findAll({
      where: { selectKey },
      include: [
        { model: User, attributes: ['nickname', 'point'] },
        {
          model: Recomment,
          include: [{ model: User, attributes: ['nickname', 'point'] }],
        },
      ],
      order: [['commentKey', 'ASC']],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      ok: true,
      msg: '댓글 조회 성공',
      result: datas.map((e) => {
        return {
          commentKey: e.commentKey,
          comment: e.comment,
          nickname: e.User.nickname,
          userKey: e.userKey,
          ponit: e.User.point,
          time: e.updatedAt,
          recomment: e.Recomments,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// 해당 댓글 수정
router.put('/:commentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { commentKey } = req.params;
    const { comment } = req.body;

    if (comment === '') {
      throw new ErrorCustom(400, '댓글을 입력해주세요.');
    }
    // if (comment.length > 200) {
    // throw new ErrorCustom(400, '댓글은 200자 이내로 작성 가능합니다.');
    // }

    const data = await Comment.findOne({
      where: { commentKey },
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await Comment.update({ comment }, { where: { commentKey, userKey } });

      const updateComment = await Comment.findOne({
        where: { commentKey },
      });

      return res.status(200).json({
        ok: true,
        msg: '댓글 수정 성공',
        result: {
          commentKey: data.commentKey,
          comment: comment,
          nickname: nickname,
          userKey,
          time: updateComment.updatedAt,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

// 댓글 삭제
router.delete('/:commentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { commentKey } = req.params;

    const data = await Comment.findOne({ where: { commentKey } });

    if (!data) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await Comment.destroy({ where: { commentKey, userKey } });

      return res.status(200).json({
        ok: true,
        msg: '댓글 삭제 성공',
        result: {
          commentKey: data.commentKey,
          comment: data.comment,
          nickname: nickname,
          userKey,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
