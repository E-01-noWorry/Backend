require('dotenv').config();
const passport = require('passport');
const KaKaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');

module.exports = () => {
  passport.use(
    new KaKaoStrategy(
      {
        clientID: process.env.CLIENT_ID, // 카카오 로그인에서 발급받은 REST API 키
        callbackURL: process.env.CALLBACK_URL, // 카카오 로그인 Redirect URI 경로
      },

      async (accessToken, refreshToken, profile, done) => {
        console.log(accessToken, "토큰확인111")
        console.log(refreshToken, "토큰확인222")

        try {const exUser = await User.findOne({
              // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
          where : {snsId: profile.id, provider: 'kakao'}
        })
            // 이미 가입된 카카오 프로필이면 성공
        if (exUser) {
          done(null, exUser);
          console.log(exUser, '카카오 로그인 성공!')
        } else {
          const newUser = await User.create({
            nickname: profile.displayName,
            snsId: profile.id,
            provider: 'kakao'
          })
          console.log(newUser, '뉴유저')
          done(null, newUser)
        }} catch(error) {
          done(error)
        }
      }
  ));
};
