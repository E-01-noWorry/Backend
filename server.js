const { server } = require('./socket');
require('dotenv').config();

if (process.env.NODE_ENV == 'production' && process.env.PORT2) {
  const port2 = process.env.PORT2;

  server.listen(port2, () => {
    console.log(port2, '포트로 https 서버가 열렸어요!');
  });
} else {
  const port = process.env.PORT;

  server.listen(port, () => {
    console.log(port, '포트로 http 서버가 열렸어요!');
  });
}
