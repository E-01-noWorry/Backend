require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorCustom = require('../advice/errorCustom');

module.exports = (req, res, next) => {
  try {
    console.log(req.headers, '11');
    const accessToken = req.headers.accesstoken;
    const refreshToken = req.headers.refreshtoken;

    console.log(accessToken, 'accessToken확인');
    console.log(refreshToken, 'refreshToken확인');

    if (!accessToken) {
      // res.status(401).json({err:'accessToken이 없습니다.'})
      throw new ErrorCustom(401, 'accessToken이 없습니다.');
    }
    const accessAuthType = accessToken.split(' ')[0];
    const accessAuthToken = accessToken.split(' ')[1];
    const refreshAuthType = refreshToken.split(' ')[0];
    const refreshAuthToken = refreshToken.split(' ')[1];

    if (accessAuthType !== 'Bearer' || refreshAuthType !== 'Bearer') {
      res.status(401).json({ err: '토큰 타입이 맞지 않습니다.' });
      // throw new ErrorCustom(401, '토큰 타입이 맞지 않습니다.');
    }

    if (
      accessAuthToken === null ||
      accessAuthToken === undefined ||
      !accessAuthToken ||
      refreshAuthToken === null ||
      refreshAuthToken === undefined ||
      !refreshAuthToken
    ) {
      res.status(401).json({ err: '토큰이 유효하지 않습니다.' });
      // throw new ErrorCustom(401, '토큰이 유효하지 않습니다.');
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
      //1.access토큰, refresh토큰 모두 사용 불가
      if (!accessVerified && !refreshVerified) {
        res.status(401).json({ err: '로그인 후 사용 가능합니다(1)' });
        // throw new ErrorCustom(401, '로그인 후 사용 가능합니다.33');
      }

      //2.access토큰은 만료되었지만 refresh토큰이 존재한다면 db에서 토큰을 비교하여 accessToken 발급
      if (!accessVerified && refreshVerified) {
        const existUser = User.findOne({
          where: { refreshToken: refreshAuthToken },
        });
        if (!existUser) {
          res.status(401).json({ err: '존재하지 않은 사용자입니다' });
          // throw new ErrorCustom(401, '존재하지 않은 사용자입니다.');
        }

        // accessToken 발급
        const userKey = existUser?.userKey; //옵셔널 체이닝
        console.log(userKey, 'userKey확인');

        const newAccessToken = jwt.sign({ userKey }, process.env.SECRET_KEY, {
          expiresIn: '1m',
        });
        console.log(newAccessToken, 'newAccessToken 확인');

        return res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: refreshAuthToken,
          msg: 'acceess 토큰이 재발급 되었습니다.',
        });
      }

      //3.access토큰은 있지만, refresh토큰 사용 불가하다면 refreshToken 발급
      if (accessVerified && !refreshVerified) {
        const { userKey } = accessVerified;

        // refreshToken 발급
        const newRefreshToken = jwt.sign({ userKey }, process.env.SECRET_KEY, {
          expiresIn: '3m',
        });
        console.log(newRefreshToken, 'newRefreshToken 확인');

        // refreshToken 발급 후 db에 저장
        User.update({ refreshToken: newRefreshToken }, { where: { userKey } });

        const existUser = User.findOne({ where: { userKey } });
        if (!existUser) {
          res.status(401).json({ err: '존재하지 않은 사용자입니다' });
          // throw new ErrorCustom(401, '존재하지 않은 사용자입니다.');
        }
        console.log(existUser, 'existUser 확인');

        return res.status(200).json({
          refreshToken: newRefreshToken,
          accessToken: accessAuthToken,
          msg: 'refresh 토큰이 재발급 되었습니다.',
        });
      }

      if (accessVerified && refreshVerified) {
        const { userKey } = accessVerified;

        User.findOne({
          where: { userKey },
          attributes: ['userKey', 'userId', 'nickname'],
        }).then((user) => {
          res.locals.user = user;
          res.locals.accessToken = accessAuthToken;
          next();
        });
      }
    } catch (error) {
      res.status(401).json({ err: '유효하지 않은 토큰입니다.' });
      // throw new ErrorCustom(401, '유효하지 않은 토큰입니다.');
    }
  } catch (error) {
    res.status(401).json({ err: '로그인 후 사용 가능합니다(2)' });
    // throw new ErrorCustom(401, '로그인 후 사용 가능합니다.22');
  }
};
