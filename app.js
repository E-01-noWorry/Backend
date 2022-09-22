const express = require('express');
const Router = require('./routes/index');
const errorHandler = require('./advice/errorHandler');
const logger = require('./config/winston');
const morganMiddleware = require('./config/morganMiddleware');

const session = require('cookie-session');
const passport = require('passport');
const passportConfig = require('./passport');

require('dotenv').config();

const app = express();

app.use(morganMiddleware);

//
const path = require('path');
app.use(express.static(path.join(__dirname, 'src')));
//

const cors = require('cors');
app.use(
  cors({
    origin: true, // 출처 허용 옵션
    withCredentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
);

passportConfig();

app.use(express.json());
app.use(express.static('public'));
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

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', Router);
app.get('/', (req, res) => {
  res.status(200).json({ massage: '서버 잘 켜짐.' });
});
app.use(errorHandler);

module.exports = app;
