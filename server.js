const { server } = require('./socket');
require('dotenv').config();
const port = process.env.PORT2;

server.listen(port, () => {
  console.log(port, '포트로 http 서버가 열렸어요!');
})
