require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization, "auth 확인!");

  const [authType, authToken] = (authorization || "").split(" ");

  if(authType !== "Bearer") {
    return res.status(401).send({
      errMsg: "로그인 후 사용하세요."
    });
  }
  try {
    const decoded = jwt.verify(authToken, process.env.SECRET_KEY);

    User.findOne({ where : {userKey:decoded.userKey} }).then((user) => {
      res.locals.user = user;
      next();
    });

  } catch (err) {
    res.status(401).send({
      errMsg : "로그인 후 사용하세요."
    })
  }
};
