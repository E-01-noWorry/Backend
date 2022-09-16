const express = require('express');
const Router = require('./routes/index');
const errorHandler = require('./advice/errorHandler');
const logger = require('./config/winston');
const morganMiddleware = require('./config/morganMiddleware');
const fs = require('fs');
const http = require('http');
const https = require('https');

const session = require('cookie-session');
const passport = require('passport');
const passportConfig = require('./passport');

const webSocket = require('./socket');

require('dotenv').config();
const port = process.env.PORT;

const app = express();

app.use(morganMiddleware);

const path = require('path');

const cors = require('cors');
app.use(
  cors({
    origin: true, // 출처 허용 옵션
    withCredentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
);

passportConfig();

app.use(express.json());

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: [process.env.KAKAO_SECRET, process.env.GOOGLE_SECRET],
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize()); // passport를 초기화 하기 위해서 passport.initialize 미들웨어 사용??
app.use(passport.session());

app.use('/api', Router);
app.get('/', (req, res) => {
  res.status(200).json({ massage: '연동 잘 됨.' });
});
app.use(errorHandler);

if (process.env.NODE_ENV == 'production') {
  try {
    const port2 = process.env.PORT2;
    const options = {
      ca: fs.readFileSync('/etc/letsencrypt/live/jolee.shop/fullchain.pem'),
      key: fs.readFileSync('/etc/letsencrypt/live/jolee.shop/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/jolee.shop/cert.pem'),
    };
    app.use(express.static('public'));

    http.createServer(app).listen(port);
    const server = https.createServer(options, app).listen(port2, () => {
      console.log(port2, '포트로 https 서버가 열렸어요!');
    });
    webSocket(server, app);
  } catch (err) {
    console.log('HTTPS 서버가 실행되지 않습니다.');
    console.log(err);
  }
} else {
  const server = app.listen(port, () => {
    console.log(port, '포트로 http 서버가 열렸어요!');
  });
  webSocket(server, app);
}

module.exports = app;
