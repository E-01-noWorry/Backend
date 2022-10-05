const joi = require('../advice/joiSchema');
const ErrorCustom = require('../advice/errorCustom');

const UserService = require('../services/user.service');

class UserController {
  userService = new UserService();

  postSignup = async (req, res, next) => {
    try {
      const result = joi.userSchema.validate(req.body);

      if (result.error) {
        throw new ErrorCustom(400, '형식에 맞게 모두 입력해주세요');
      }
      const { userId, nickname, password, confirm } = result.value;

      const createUser = await this.userService.createUser(
        userId,
        nickname,
        password,
        confirm
      );

      res.status(201).json({
        msg: '회원가입에 성공하였습니다.',
      });
    } catch (error) {
      next(error);
    }
  };

  userLogin = async (req, res, next) => {
    try {
      const { userId, password } = req.body;

      const user = await this.userService.loginUser(userId, password);

      res.status(200).json({
        nickname: user[0].nickname,
        userKey: user[0].userKey,
        accessToken: user[1],
        refreshToken: user[0].refreshToken,
        msg: '로그인에 성공하였습니다.',
      });
    } catch (error) {
      next(error);
    }
  };

  confirmUser = async (req, res, next) => {
    try {
      const { userKey, nickname, userId } = res.locals.user;
      const { accessToken } = res.locals;

      const existUser = await this.userService.checkUser(userKey);

      res.status(200).json({
        ok: true,
        msg: '로그인 유저 정보 확인',
        accessToken,
        refreshToken: existUser.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  changeNickname = async (req, res, next) => {
    try {
      const { userKey } = res.locals.user;
      const validation = joi.nicknameSchema.validate(req.body);

      if (validation.error) {
        throw new ErrorCustom(400, '한글, 영어, 숫자 2~10자로 입력해주세요.');
      }
      const { nickname } = validation.value;

      await this.userService.changeNic(userKey, nickname);

      return res.status(201).json({
        userKey,
        nickname,
        msg: '닉네임 변경이 완료되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const { userKey } = res.locals.user;

      await this.userService.deleteUser(userKey);

      res.status(200).json({
        ok: true,
        userKey,
        msg: '회원 정보가 삭제되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;
