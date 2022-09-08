require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

// 단순히 로그인 비로그인을 확인하는 미들웨어(비로그인시 locals에 유저정보 담지 않고 그냥 next로 넘어감)
module.exports = (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (authorization) {
      const [authType, authToken] = (authorization || '').split(' ');

      if (authType !== 'Bearer') {
        throw new ErrorCustom(401, '토큰 타입이 맞지 않습니다.');
      }

      try {
        const decoded = jwt.verify(authToken, process.env.SECRET_KEY);

        User.findOne({
          where: { userKey: decoded.userKey },
          attributes: ['userKey', 'userId', 'nickname'],
        }).then((user) => {
          res.locals.user = user;
          next();
        });
        return;
      } catch (err) {
        throw new ErrorCustom(401, '토큰이 유효하지 않습니다.(기간만료 등)');
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
