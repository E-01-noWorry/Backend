const { User, Comment, Recomment } = require('../models');

class RecommentRepository{

    findCommentKey = async(commentKey) => {
        const findCommentKey = await Select.findOne({ 
            where: { commentKey },
            include: [{ model: User, attributes: ['deviceToken'] }],
        })
        return findCommentKey;
    };

    createRecomments = async(comment, comment, userKey) => {
        const createRecomments = await Comment.create({
            comment, 
            selectKey, 
            userKey
        });
        console.log(createRecomments.comment);

        return createRecomments;
    };


    //이 부분
    findRecomment = async( commentKey  ) => {
        const findRecomment = await Recomment.findOne({
            where: { commentKey },
            include: [{ model: User, attributes: ['nickname', 'point'] }],
          });

        return findRecomment;
    };



    findRecomment = async(recommentKey) => {
        const findRecomment = await Recomment.findOne({
             where: { recommentKey } 
        });

        return findRecomment;
    };

    updateRecomment = async(recommentKey) => {
        const updateRecomment = await Recomment.findOne({
            where: { recommentKey },
            include: [{ model: User, attributes: ['nickname', 'point'] }],
        });

        return updateRecomment;
    };

}





module.exports = RecommentRepository