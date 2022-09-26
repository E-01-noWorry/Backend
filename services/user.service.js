const jwt = require('jsonwebtoken');
const joi = require('../advice/joiSchema');
const { Op } = require('sequelize');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const ErrorCustom = require('../advice/errorCustom');

class UserService {
  createUser = async (userId, nickname, password, confirm) => {
    const exitUsers = await User.findAll({
      where: { [Op.or]: { userId } },
    });

    if (exitUsers.length) {
      throw new ErrorCustom(400, '이미 사용중인 아이디입니다.');
    }

    const salt = await bcrypt.genSalt(10); //기본이 10, 숫자가 높을 수록 연산 시간과 보안이 높아짐.
    const pwHash = await bcrypt.hash(password, salt);
    await User.create({ userId, nickname, password: pwHash, point: 0 });

    return { msg: '회원가입에 성공하였습니다.' };
  };

  loginUser = async (userId, password) => {
    const user = await User.findOne({ where: { userId } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new ErrorCustom(400, '아이디 또는 패스워드가 잘못되었습니다.');
    }

    const accessToken = jwt.sign(
      { userKey: user.userKey },
      process.env.SECRET_KEY,
      {
        expiresIn: '3h',
      }
    );
    const refreshToken = jwt.sign(
      { userKey: user.userKey },
      process.env.SECRET_KEY,
      {
        expiresIn: '14d',
      }
    );
    console.log(accessToken, 'access토큰 확인');
    console.log(refreshToken, 'refresh토큰 확인');

    await user.update({ refreshToken }, { where: { userKey: user.userKey } });

    return {
      nickname: user.nickname,
      userKey: user.userKey,
      accessToken,
      refreshToken: user.refreshToken,
      msg: '로그인에 성공하였습니다.',
    };
  };

  checkUser = async (userKey, nickname, userId) => {
    const existUser = await User.findOne({ where: { userKey } });

    return existUser;
  };

  changeUser = async (userKey, nickname) => {
    const user = await User.findOne({ where: { userKey } });

    await User.update({ nickname }, { where: { userKey } });

    return {
      userKey,
      nickname,
      msg: '닉네임 변경이 완료되었습니다.',
    };
  };
}

module.exports = UserService;
