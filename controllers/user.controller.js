const jwt = require('jsonwebtoken');
const joi = require('../advice/joiSchema');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

const UserService = require('../services/user.service');

//작업시작

class UserController {
  userService = new UserService();

  postSignup = async (req, res, next) => {
    try {
      const result = joi.userSchema.validate(req.body);
      if (result.error) {
        throw new ErrorCustom(400, '형식에 맞게 모두 입력해주세요');
      }
      const { userId, nickname, password, confirm } = result.value;
      if (password !== confirm) {
        throw new ErrorCustom(400, '패스워드가 일치하지 않습니다.');
      }

      const createUser = await this.userService.createUser(
        userId,
        nickname,
        password
      );

      res.status(201).json(createUser);
    } catch (error) {
      next(error);
    }
  };

  userLogin = async (req, res, next) => {
    try {
      const { userId, password } = req.body;

      const user = await this.userService.loginUser(userId, password);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  confirmUser = async (req, res, next) => {
    try {
      const { userKey, nickname, userId } = res.locals.user;
      const { accessToken } = res.locals;

      const existUser = await this.userService.checkUser(
        userKey,
        nickname,
        userId
      );

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

  changeNickname = async (req, res) => {
    try {
      const { userKey } = joi.userKeySchema.validate(req.params).value;

      const validation = joi.nicknameSchema.validate(req.body);

      if (validation.error) {
        throw new ErrorCustom(400, '한글, 영어, 숫자 2~10자로 입력해주세요.');
      }

      const { nickname } = validation.value;

      const user = await this.userService.changeUser(userKey, nickname);

      return res.status(201).json( user );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;
