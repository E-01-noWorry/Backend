require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

module.exports = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization, 'auth 확인!');

    const [authType, authToken] = authorization.split(' ');

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
    } catch (err) {
      throw new ErrorCustom(401, '토큰이 유효하지 않습니다.(기간만료 등)');
    }
  } catch (err) {
    throw new ErrorCustom(401, '로그인 후 사용 가능합니다.');
  }
};
