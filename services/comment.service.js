const { Select, User, Comment, Recomment } = require('../models');
const ErrorCustom = require('../advice/errorCustom');
const admin = require('firebase-admin');

const CommentRepository = require('../repositories/comment.repository');


//commit 
class CommentService {
  commentRepository = new CommentRepository();

  createComment = async (comment, selectKey, userKey, nickname) => {

    const data = await this.commentRepository.findSelectKey(selectKey);


    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const createComments = await this.commentRepository.createComments(
      comment,
      selectKey,
      userKey,
    );
    



    const findComment = await this.commentRepository.findComment(createComments);
    console.log(findComment);

    // 글쓴이 토큰 유무 확인 후 알림 보내주기
    if (data.User.deviceToken) {
      let target_token = data.User.deviceToken;

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
        commentKey: createComments.commentKey,
        comment,
        nickname: nickname,
        userKey,
        point: findComment.User.point,
        updatedAt: findComment.updatedAt,
      },
    };
  };

  allComments = async (selectKey) => {
    const data = await Select.findOne({ where: { selectKey } });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const datas = await this.commentRepository.findAllComment(
      selectKey
    );

    return {
      ok: true,
      msg: '대댓글 조회 성공',
      result: datas.map((e) => {
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
    const data = await this.commentRepository.findCmt(
      commentKey
    );

    if (!data) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      const updateCmt = await Comment.findOne({
        where: { commentKey },
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      });

      return {
        ok: true,
        msg: '댓글 수정 성공',
        result: {
          commentKey,
          comment,
          nickname: nickname,
          userKey,
          point: updateCmt.User.point,
          updatedAt: updateCmt.updatedAt,
        },
      };
    }
  };

  deleteComment = async (userKey, commentKey, nickname) => {
    const data = await this.commentRepository.findCmt(
      commentKey
    );

    if (!data) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.');
    }

    if (userKey !== data.userKey) {
      throw new ErrorCustom(400, '작성자가 다릅니다.');
    } else {
      await Comment.destroy({ where: { commentKey, userKey } });
    }

    return {
      ok: true,
      msg: '댓글 삭제 성공',
      result: {
        commentKey: data.commentKey,
        comment: data.comment,
        nickname: nickname,
        userKey,
      },
    };
  };
}

module.exports = CommentService;
