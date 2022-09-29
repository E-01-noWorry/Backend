const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ErrorCustom = require('../advice/errorCustom');

const UserRepository = require('../repositories/user.repository');

class UserService {
  userRepository = new UserRepository();

  createUser = async (userId, nickname, password, confirm) => {
    if (password !== confirm) {
      throw new ErrorCustom(400, '패스워드가 일치하지 않습니다.');
    }

    const findId = await this.userRepository.findOneId(userId);

    if (findId) {
      throw new ErrorCustom(400, '이미 사용중인 아이디입니다.');
    }

    const oneNic = await this.userRepository.findOneNic(nickname);

    if (oneNic) {
      throw new ErrorCustom(400, '중복된 닉네임입니다.');
    }

    const salt = await bcrypt.genSalt(10); //기본이 10, 숫자가 높을 수록 연산 시간과 보안이 높아짐.
    const pwHash = await bcrypt.hash(password, salt);

    await this.userRepository.createUser(userId, nickname, pwHash);

    return { msg: '회원가입에 성공하였습니다.' };
  };

  loginUser = async (userId, password) => {
    const user = await this.userRepository.findOneId(userId);

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

    await this.userRepository.updateRefresh(refreshToken, user);

    return {
      nickname: user.nickname,
      userKey: user.userKey,
      accessToken,
      refreshToken: user.refreshToken,
      msg: '로그인에 성공하였습니다.',
    };
  };

  checkUser = async (userKey) => {
    const existUser = await this.userRepository.findOneUser(userKey);

    return existUser;
  };

  changeNic = async (userKey, nickname) => {
    const oneNic = await this.userRepository.findOneNic(nickname);

    if (oneNic) {
      throw new ErrorCustom(400, '중복된 닉네임입니다.');
    }

    await this.userRepository.changeNic(userKey, nickname);
  };

  deleteUser = async (userKey) => {
    await this.userRepository.delUser(userKey);
  };
}

module.exports = UserService;
