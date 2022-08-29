require('dotenv').config();
const passport = require('passport');
const kakao = require('./kakao');
const google = require('./google');

//로그인 시에만 실행
module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  //매 요청시 실행
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  kakao();
  google();
};
