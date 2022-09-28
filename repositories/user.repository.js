const { User } = require('../models');
const { Op } = require('sequelize');

class UserRepository {
  createUser = async (userId, nickname, password, confirm) => {
    const exitUsers = await User.findAll({
      where: { [Op.or]: { userId } },
    });

    return exitUsers;
  };

  loginUser = async (userId, password) => {
    const user = await User.findOne({ where: { userId } });

    await user.update(
      { refreshToken: user.refreshToken },
      { where: { userKey: user.userKey } }
    );

    return user;
  };

  checkUser = async (userKey, nickname, userId) => {
    const existUser = await User.findOne({ where: { userKey } });

    return existUser;
  };

  changeUser = async (userKey, nickname) => {
    const user = await User.findOne({ where: { userKey } });

    return user;
  };
}

module.exports = UserRepository;
