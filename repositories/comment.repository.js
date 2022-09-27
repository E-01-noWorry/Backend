const { Select, User, Comment, Recomment } = require('../models');

class CommentRepository{

    findSelectKey = async(selectKey) => {
        const findSelectKey = await Select.findOne({ 
            where: { selectKey },
            include: [{ model: User, attributes: ['deviceToken'] }],
        })
        return findSelectKey;
    };

    createComments = async(comment, selectKey, userKey) => {
        const createComments = await Comment.create({
            comment, 
            selectKey, 
            userKey
        });
        console.log(createComments.comment);

        return createComments;
    };


    //이 부분
    findComment = async( createComments ) => {
        const findComment = await Comment.findOne({
            where: { commentKey: createComments.commentKey },
            include: [{ model: User, attributes: ['nickname', 'point'] }],
          });

        return findComment;
    };

    findAllComment = async(selectKey) => {
        const findAllComment = await Comment.findAll({
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

        return findAllComment;
    };

    findCmt = async(commentKey) => {
        const findCmt = await Comment.findOne({
             where: { commentKey } 
        });

        return findCmt;
    };

}





module.exports = CommentRepository