const express = require('express');
const router = express.Router();
const { User, Comment, Recomment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');

const admin = require('firebase-admin');
const Joi = require('joi');

const recommentSchema = Joi.object({
  comment: Joi.string().required(),
});

// 대댓글 작성
router.post('/:commentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { commentKey } = req.params;
    const result = recommentSchema.validate(req.body);
    if (result.error) {
      throw new ErrorCustom(400, '대댓글을 입력해주세요.');
    }
    const { comment } = result.value;

    const data = await Comment.findOne({
      where: { commentKey },
      include: [{ model: User, attributes: ['deviceToken'] }],
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    const newComment = await Recomment.create({
      comment,
      commentKey,
      userKey,
    });

    const newCmt = await Recomment.findOne({
      where: { commentKey: newComment.commentKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    if (data.User.deviceToken) {
      let target_token = data.User.deviceToken;

      const message = {
        token: target_token,
        data: {
          title: '곰곰',
          body: '작성한 댓글에 대댓글이 달렸습니다!',
          link: `detail/${data.selectKey}`,
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
      msg: '대댓글 작성 성공',
      result: {
        commentKey,
        recommentKey: newComment.recommentKey,
        comment,
        userKey,
        User: {
          nickname,
          point: newCmt.User.point,
        },
        time: newCmt.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 해당 대댓글 수정
router.put('/:recommentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { recommentKey } = req.params;
    const result = recommentSchema.validate(req.body);
    if (result.error) {
      throw new ErrorCustom(400, '대댓글을 입력해주세요. 50자까지 가능합니다.');
    }
    const { comment } = result.value;

    const data = await Recomment.findOne({
      where: { recommentKey },
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 대댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await Recomment.update({ comment }, { where: { recommentKey, userKey } });

      const updateComment = await Recomment.update(
        { comment },
        { where: { recommentKey } }
      );

      const updateCmt = await Recomment.findOne({
        where: { recommentKey },
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      });

      return res.status(200).json({
        ok: true,
        msg: '대댓글 수정 성공',
        result: {
          commentKey: updateCmt.commentKey,
          recommentKey,
          comment,
          User: {
            nickname,
            point: updateCmt.User.point,
          },
          userKey,
          time: updateCmt.updatedAt,
        },
      });
    }
  } catch (err) {
    next(err);
  }
});

// 대댓글 삭제
router.delete('/:recommentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { recommentKey } = req.params;

    const data = await Recomment.findOne({ where: { recommentKey } });

    if (!data) {
      throw new ErrorCustom(400, '해당 대댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await Recomment.destroy({ where: { recommentKey, userKey } });

      return res.status(200).json({
        ok: true,
        msg: '대댓글 삭제 성공',
        result: {
          recommentKey: data.recommentKey,
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
