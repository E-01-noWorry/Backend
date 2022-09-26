require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

// 단순히 로그인 비로그인을 확인하는 미들웨어(비로그인시 locals에 유저정보 담지 않고 그냥 next로 넘어감)
module.exports = async (req, res, next) => {
  try {
    const accessToken = req.headers.accesstoken;
    const refreshToken = req.headers.refreshtoken;

    // console.log(accessToken, '이즈로그인 미들웨어 accessToken확인');
    // console.log(refreshToken, '이즈로그인 미들웨어 refreshToken확인');

    if (accessToken && refreshToken) {
      const accessAuthType = accessToken.split(' ')[0];
      const accessAuthToken = accessToken.split(' ')[1];
      const refreshAuthType = refreshToken.split(' ')[0];
      const refreshAuthToken = refreshToken.split(' ')[1];

      if (accessAuthType !== 'Bearer' || refreshAuthType !== 'Bearer') {
        throw new ErrorCustom(401, '토큰 타입이 맞지 않습니다.');
      }

      let accessVerified = null;
      let refreshVerified = null;

      try {
        accessVerified = jwt.verify(accessAuthToken, process.env.SECRET_KEY);
      } catch (error) {
        accessVerified = null;
      }

      try {
        refreshVerified = jwt.verify(refreshAuthToken, process.env.SECRET_KEY);
      } catch (error) {
        refreshVerified = null;
      }

      try {
        if (accessVerified && refreshVerified) {
          const { userKey } = accessVerified;
          await User.findOne({
            where: { userKey },
            attributes: ['userKey', 'userId', 'nickname'],
          }).then((user) => {
            res.locals.user = user;
            res.locals.accessToken = accessAuthToken;
            next();
          });
        } else {
          next();
        }
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};
