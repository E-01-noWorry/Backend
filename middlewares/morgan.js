const morgan = require('morgan');
const logger = require('../advice/winston');
require('dotenv').config();

// 사용자의 입력값을 출력할 수 있게 함
morgan.token('request', function (req, res) {
  return 'Request_' + JSON.stringify(req.body);
});

const format = () => {
  const result =
    process.env.NODE_ENV === 'production'
      ? '[:remote-addr - :remote-user] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] ":referrer" ":user-agent"'
      : ':method :url :status :response-time ms - :res[content-length] :request';
  return result;
};

// 로그 작성을 위한 Output stream옵션.
const stream = {
  write: (message) => {
    logger.info(message);
  },
};

// 로깅 스킵 여부
const skip = (_, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.statusCode < 200;
  }
  return false;
};

// 적용될 moran 미들웨어 형태
const morganMiddleware = morgan(format(), { stream, skip });

module.exports = morganMiddleware;
