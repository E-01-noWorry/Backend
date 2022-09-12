const express = require('express');
const router = express.Router();
const { Select, User, Comment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');
const { RoboMaker } = require('aws-sdk');

// 대댓글 작성
router.post('/:commentKey', authMiddleware, async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { commentKey } = req.params;
      const { recomment } = req.body;

      if (recomment === '') {
        throw new ErrorCustom(400, '대댓글을 입력해주세요.');
      }
  
      const commentData = await Comment.findOne({ where: { commentKey } });
  
      if(!commentData) {
        throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.'); //댓글 확인
      }
  
      const newComment = await Recomment.create({
        comment,
        selectKey,
        userKey,
      });
  
    }catch(err) {
        next(err)
    }
  });
  
  //대댓글 수정 수정은 그냥 댓글수정과 다를 건 없을 듯
  router.put('/:parentKey/:commentKey', async (req,res,next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { commentKey } = req.params.commentKey;
      const { comment } = req.body;
  
      if (comment === '') {
        throw new ErrorCustom(400, '대댓글을 입력해주세요.');
      }
  
      const data = await Comment.findOne({
        where: { commentKey },
      });
  
      if (!data) {
        throw new ErrorCustom(400, '해당 대댓글이 존재하지 않습니다.');
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
            userKey        
          },
        });
      }
    } catch (err) {
      next(err);
    }
  });
  
  //대댓글 삭제 삭제는 그냥 있는 걸 똑같이 쓰면 될거 같으나 대댓글 개수 순서 등을 수정해줘야해서 다를 듯 
  router.delete('/:parentKey/:commentKey', authMiddleware, async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { commentKey } = req.params;
  
      const data = await Comment.findOne({ where: { commentKey } });
  
      if (!data) {
        throw new ErrorCustom(400, '해당 대댓글이 존재하지 않습니다.');
      }
  
      if (userKey !== data.userKey) {
        throw new ErrorCustom(400, '작성자가 다릅니다.');
      } 
  
      const count = await Comment.findOne({ //부모의 대댓글 개수
        where: { count: parentKey.count }
      });
  
    //자식이 없게될 경우
    if(count === 0 ) {
      const data1 = await Comment.update({ //자식이 없으니 0, group 정보도 없앰
          parent: 0,
          group: 0
      });
    }
  
    //자식있으면 대댓글 길이만 변경
    else{ 
      const data2 = await Comment.update({ //자식이 없으니 0, group 정보도 없앰
        // count =  count - 1, //코드 추후 수정
      });
    }
  
    //이제 대댓글 정보 수정 대댓글 순서정보 가져오고 
    const commentCount = await Comment.findOne({ //해당 대댓글의 순서 정보
      where: { count: commentKey.order }
    });
  
    //이제 해당 대댓글의 순서보다 큰 애들만 order -= 1해준다
  
  
    //했다면 대댓글을 삭제하면 끝일듯
  
    await Comment.destroy({ where: { commentKey, userKey } });
  
    return res.status(200).json({
      ok: true,
      msg: '대댓글 삭제 성공',
      result: {
        commentKey: data.commentKey,
        comment: data.comment,
        nickname: nickname,
        userKey,
      }
    });
  
    } catch (err) {
      next(err);
    }
  });

  module.exports = router;
