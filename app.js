const express = require('express');
const Router = require('./routes/index');
const errorHandler = require('./advice/errorHandler');
const logger = require('./config/winston');
// global.logger || (global.logger = require('./config/logger'));
const morganMiddleware = require('./config/morganMiddleware2');
// const morgan = require('morgan');

const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport');

const webSocket = require('./socket');

require('dotenv').config();
const port = process.env.PORT;

const app = express();

// if (process.env.NODE_ENV === 'production') {
//   app.use(morganMiddleware('combined')); // 배포환경이면
// } else {
//   app.use(morgan('dev', { stream: logger.stream })); // 개발환경이면
// }
// app.use(morgan('dev'));
app.use(morganMiddleware);

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
  // logger.info('GET /');
  res.status(200).json({ massage: '연동 잘 됨.' });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(port, '포트로 서버 오픈');
  // logger.info(`${port} 포트로 서버가 열렸어요!`);
});
