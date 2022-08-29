const express = require('express');
const router = express.Router();
const { Select, User, Comment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const { route } = require('./select');

// 댓글 작성
router.post('/:selectKey', authMiddleware, async (req, res) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { selectKey } = req.params;
    const { comment } = req.body;

    if (comment === '') {
      return res.status(400).json({
        ok: false,
        errMsg: '댓글을 입력해주세요.',
      });
    }
    // if (comment.length > 200) {
    //   return res.status(400).json({
    //     ok: false,
    //     errMsg: '댓글은 200자 이내로 작성 가능합니다.',
    //   });
    // }

    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    const newComment = await Comment.create({
      comment,
      selectKey,
      userKey,
    });

    return res.status(200).json({
      ok: true,
      msg: '댓글 작성 성공',
      result: {
        commentKey: newComment.commentKey,
        comment: newComment.comment,
        nickname: nickname,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '댓글 작성 실패.',
    });
  }
});

// 해당 게시물 댓글 모두 조회
router.get('/:selectKey', async (req, res) => {
  try {
    const { selectKey } = req.params;

    const data = await Select.findOne({
      where: { selectKey },
    });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 선택글이 존재하지 않음',
      });
    }

    const datas = await Comment.findAll({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname'] }],
      order: [['commentKey', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      msg: '댓글 조회 성공',
      result: datas.map((e) => {
        return {
          commentKey: e.commentKey,
          comment: e.comment,
          nickname: e.User.nickname,
        };
      }),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '댓글 조회 실패.',
    });
  }
});

// 해당 댓글 수정
router.put('/:commentKey', authMiddleware, async (req, res) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { commentKey } = req.params;
    const { comment } = req.body;

    if (comment === '') {
      return res.status(400).json({
        ok: false,
        errMsg: '댓글을 입력해주세요.',
      });
    }
    // if (comment.length > 200) {
    //   return res.status(400).json({
    //     ok: false,
    //     errMsg: '댓글은 200자 이내로 작성 가능합니다.',
    //   });
    // }

    const data = await Comment.findOne({
      where: { commentKey },
    });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 댓글이 존재하지 않음',
      });
    }

    if (userKey !== data.userKey) {
      return res.status(400).json({
        ok: false,
        errMsg: '작성자가 다릅니다.',
      });
    } else {
      await Comment.update({ comment }, { where: { commentKey, userKey } });

      return res.status(200).json({
        ok: true,
        msg: '댓글 수정 성공',
        result: {
          commentKey: data.commentKey,
          comment: comment,
          nickname: nickname,
        },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '댓글 수정 실패.',
    });
  }
});

// 댓글 삭제
router.delete('/:commentKey', authMiddleware, async (req, res) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { commentKey } = req.params;

    const data = await Comment.findOne({ where: { commentKey } });

    if (!data) {
      return res.status(400).json({
        ok: false,
        errMsg: '해당 댓글이 존재하지 않음',
      });
    }

    if (userKey !== data.userKey) {
      return res.status(400).json({
        ok: false,
        errMsg: '작성자가 다릅니다.',
      });
    } else {
      await Comment.destroy({ where: { commentKey, userKey } });

      return res.status(200).json({
        ok: true,
        msg: '댓글 삭제 성공',
        result: {
          commentKey: data.commentKey,
          comment: data.comment,
          nickname: nickname,
        },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      errMsg: '댓글 삭제 실패.',
    });
  }
});

module.exports = router;
