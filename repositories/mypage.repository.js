const { Select, User, Vote, Room, Participant } = require('../models');

class PostRepository {
  findOneUser = async (userKey) => {
    const userInfo = await User.findOne({ where: { userKey } });
    return userInfo;
  };

  findAllSelect = async (userKey, offset, limit) => {
    const mySelects = await Select.findAll({
      where: { userKey },
      include: [{ model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return mySelects;
  };
}

module.exports = PostRepository;
