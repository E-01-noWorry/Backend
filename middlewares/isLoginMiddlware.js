require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

// 단순히 로그인 비로그인을 확인하는 미들웨어(비로그인시 locals에 유저정보 담지 않고 그냥 next로 넘어감)
module.exports = (req, res, next) => {
  try {
    const accessToken = req.headers.accesstoken;
    const refreshToken = req.headers.refreshtoken;

    if (accessToken || refreshToken) {
      const accessAuthType = accessToken.split(' ')[0];
      const accessAuthToken = accessToken.split(' ')[1];
      const refreshAuthType = refreshToken.split(' ')[0];
      const refreshAuthToken = refreshToken.split(' ')[1];

      if (accessAuthType !== 'Bearer' || refreshAuthType !== 'Bearer') {
        throw new ErrorCustom(401, '토큰 타입이 맞지 않습니다.');
      }

      try {
        const accessVerified = jwt.verify(
          accessAuthToken,
          process.env.SECRET_KEY
        );
        const { userKey } = accessVerified;

        User.findOne({
          where: { userKey },
          attributes: ['userKey', 'userId', 'nickname'],
        }).then((user) => {
          res.locals.user = user;
          res.locals.accessToken = accessAuthToken;
          next();
        });
        return;
      } catch (err) {
        next();
      }
    }
    next();
  } catch (err) {
    next();
  }
};
