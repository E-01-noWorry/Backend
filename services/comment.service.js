const ErrorCustom = require('../advice/errorCustom');
const admin = require('firebase-admin');

const CommentRepository = require('../repositories/comment.repository');

class CommentService {
  commentRepository = new CommentRepository();

  createComment = async (comment, selectKey, userKey, nickname) => {
    const oneComment = await this.commentRepository.findOneSelect(selectKey);

    if (!oneComment) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const createComment = await this.commentRepository.createComment(
      comment,
      selectKey,
      userKey
    );

    const findComment = await this.commentRepository.findOneComment(
      createComment
    );

    if (oneComment.User.deviceToken) {
      let target_token = oneComment.User.deviceToken;

      const message = {
        token: target_token,
        data: {
          title: '곰곰',
          body: '게시물에 댓글이 달렸습니다!',
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

    return {
      ok: true,
      msg: '댓글 작성 성공',
      result: {
        commentKey: createComment.commentKey,
        comment,
        nickname,
        userKey,
        point: findComment.User.point,
        updatedAt: findComment.updatedAt,
      },
    };
  };

  allComments = async (selectKey) => {
    const oneComment = await this.commentRepository.findOneSelect(selectKey);

    if (!oneComment) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const allComments = await this.commentRepository.findAllComments(selectKey);

    return {
      ok: true,
      msg: '대댓글 조회 성공',
      result: allComments.map((e) => {
        return {
          commentKey: e.commentKey,
          comment: e.comment,
          nickname: e.User.nickname,
          userKey: e.userKey,
          point: e.User.point,
          updatedAt: e.updatedAt,
          recomment: e.Recomments,
        };
      }),
    };
  };

  putComment = async (userKey, commentKey, comment, nickname) => {
    const oneCmt = await this.commentRepository.findOneCmt(commentKey);

    if (!oneCmt) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== oneCmt.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await this.commentRepository.updateComment(comment, commentKey);

      const updatedCmt = await this.commentRepository.findOneCmt(commentKey);

      return {
        ok: true,
        msg: '댓글 수정 성공',
        result: {
          commentKey,
          comment,
          nickname,
          userKey,
          point: updatedCmt.User.point,
          updatedAt: updatedCmt.updatedAt,
        },
      };
    }
  };

  deleteComment = async (userKey, commentKey, nickname) => {
    const oneComment = await this.commentRepository.findOneCmt(commentKey);

    if (!oneComment) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== oneComment.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await this.commentRepository.delComment(commentKey, userKey);
    }

    return {
      ok: true,
      msg: '댓글 삭제 성공',
      result: {
        commentKey,
        comment: oneComment.comment,
        nickname,
        userKey,
      },
    };
  };
}

module.exports = CommentService;
