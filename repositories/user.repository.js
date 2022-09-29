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

  findOneNic = async (nickname) => {
    const findOneNic = await User.findOne({ where: { nickname } });

    return findOneNic;
  };

  changeNic = async (userKey, nickname) => {
    await User.update({ nickname }, { where: { userKey } });
  };

  delUser = async (userKey) => {
    await User.destroy({ where: { userKey } });
  };
}

module.exports = UserRepository;
