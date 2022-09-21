const { server } = require('./socket');
require('dotenv').config();
const port2 = process.env.PORT;

server.listen(port2, () => {
  console.log(port2, '포트로 http 서버가 열렸어요!');
})
