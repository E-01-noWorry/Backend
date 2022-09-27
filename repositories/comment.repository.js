const { Select, User, Comment, Recomment } = require('../models');

class CommentRepository{
    findKey = async(selectKey) => {
        const findSelectKey = await Select.findOne({ 
            where: { selectKey },
            include: [{ model: User, attributes: ['deviceToken'] }],
        })

        return findSelectKey;
    };

    createCmt = async(comment, selectKey, userKey) => {
        const createComments = await Comment.create({
            comment, 
            selectKey, 
            userKey
        });

        return createComments;
    }

    findCmt = async(commentKey) => {
        const findComments = await Comment.findOne({
            where: { commentKey: createComments.commentKey },
            include: [{ model: User, attributes: ['nickname', 'point'] }],
          });

        return findComments;
    }
}





module.exports = CommentRepository