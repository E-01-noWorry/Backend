const { Select, User, Vote, Room, Participant } = require('../models');

class MypageService {
  findUserInfo = async (userKey) => {
    const userInfo = await User.findOne({ where: { userKey } });
    return userInfo;
  };
}

module.exports = MypageService;
