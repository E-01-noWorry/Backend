const { User } = require('../models');

class UserRepository {
  findOneId = async (userId) => {
    const findOneId = await User.findOne({
      where: { userId },
    });

    return findOneId;
  };

  findOneUser = async (userKey) => {
    const findOneUser = await User.findOne({
      where: { userKey },
    });

    return findOneUser;
  };

  createUser = async (userId, nickname, pwHash) => {
    const createUser = await User.create({
      userId,
      nickname,
      password: pwHash,
      point: 0,
    });

    return createUser;
  };

  updateRefresh = async (refreshToken, user) => {
    const updateRefresh = await user.update(
      { refreshToken },
      { where: { userKey: user.userKey } }
    );

    return updateRefresh;
  };

  changeNic = async (userKey, nickname) => {
    const changeNic = await User.update({ nickname }, { where: { userKey } });

    return changeNic;
  };
}

module.exports = UserRepository;
