const express = require('express');
const router = express.Router();
const { Select, User, Comment } = require('../models');
const authMiddleware = require('../middlewares/authMiddlware');
const ErrorCustom = require('../advice/errorCustom');
const { RoboMaker } = require('aws-sdk');

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
    const { selectKey } = req.params;

    const data = await Select.findOne({
      where: { selectKey },
    });

    if (!data) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    const datas = await Comment.findAll({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname'] }],
      order: [['commentKey', 'ASC']],
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
          time: e.updatedAt,
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


// 대댓글 작성
router.post('/:selectKey/:commentKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { selectKey } = req.params.selectKey;
    const { commentKey } = req.params.commentKey;
    const { comment } = req.body;
    if (comment === '') {
      throw new ErrorCustom(400, '대댓글을 입력해주세요.');
    }

    const selectData = await Select.findOne({ where: { selectKey } });
    const commentData = await Comment.findOne({ where: { commentKey } });

    if(!selectData) {
      throw new ErrorCustom(400, '해당 글이 존재하지 않습니다.'); //게시글 확인
    }

    if(!commentData) {
      throw new ErrorCustom(400, '해당 댓글이 존재하지 않습니다.'); //댓글 확인
    }

    //먼저 할건 commentKey가 부모인지 아닌지 확인 부모면 1 아니면 0 값을 가지고 있다
    const parent = await Comment.findOne({ where: { parent : commentKey.parent }}); //문법 맞는지 확인

    const mention = await Comment.findOne({ where: { nickname : commentKey.nickname }}); 


    if(parent === 0) { //처음 대댓글이 달렸다면 대댓글을 만들어내고 부모 댓글도 정보를 업데이트 해줘야함 
       const data = await Room.create({ //대댓글 생성
          group: commentKey,
          order: 1, //대댓글 순서
          comment: comment,
          parentKey: commentKey,
          userKey: userKey,
          selectKey: selectKey,
          mention: mention
       });

       const parent = await Room.update({
          parent: 1,
          count: 1, //대댓글 개수
       });

       return res.status(200).json({
        ok: true,
        msg: '대댓글 작성 완료',
      });
    }

    else { //이미 대댓글이 있는거에 대댓글을 달 경우 이역시 대댓글 생성 부모댓글 정보 수정하면 될듯
      const data = await Room.create({ //대댓글 생성
        group: commentKey,
        order: order+1, //대댓글 순서
        comment: comment,
        parentKey: commentKey,
        userKey: userKey,
        selectKey: selectKey,
        mention: mention
     });

     const parent = await Room.update({
        count: count+1 //대댓글 개수
     });

     return res.status(200).json({
      ok: true,
      msg: '대댓글 작성 완료',
    });
    }

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
