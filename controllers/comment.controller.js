const { User, Comment, Recomment } = require('../models');
const joi = require('../advice/joiSchema');

const CommentService = require('../services/comment.service');


class CommentController {
    commentService = new CommentService();

    postComment = async (req,res,next) => {
        try {
            const { userKey, nickname } = res.locals.user;
            const { selectKey } = req.params;
            const result = joi.commentSchema.validate(req.body);
            if (result.error) {
              throw new ErrorCustom(400, '댓글을 입력해주세요. 50자까지 가능합니다.');
            }
            const { comment } = result.value;
        
            const createComment = await this.commentService.createComment(
                comment,
                selectKey,
                userKey,
            );
            
            res.status(201).json(createComment);
          } catch (err) {
            next(err);
          }
    }

    getAllComment = async(req,res,next) => {
        try {
            const { selectKey } = joi.selectSchema.validate(req.params).value;
        
            const allComment = await this.commentService.allComment(selectKey);
            
            res.status(200).json(allComment);
          } catch (err) {
            next(err);
          }
    }

    putComment = async (req,res,next)=> {
        try {
            const { userKey, nickname } = res.locals.user;
            const { commentKey } = joi.commentKeySchema.validate(req.params).value;
            const result = joi.commentSchema.validate(req.body);
            if (result.error) {
              throw new ErrorCustom(400, '댓글을 입력해주세요. 50자까지 가능합니다.');
            }

            const { comment } = result.value;


            const putComments = await this.commentService.putComments(
              userKey, 
              commentKey, 
              comment,
            );

              
            res.status(200).json(putComments);
          } catch (err) {
            next(err);
          }
    }

    deleteComment = async (req,res,next) => {
        try {
            const { userKey, nickname } = res.locals.user;
            const { commentKey } = joi.commentKeySchema.validate(req.params).value;

            const deleteComments = await this.commentService.deleteComments(
              userKey, 
              commentKey,
            );
            
            res.status(201).json( deleteComments );
          } catch (err) {
            next(err);
          }
    }
}

module.exports = CommentController;
