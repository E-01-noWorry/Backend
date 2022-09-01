const ErrorCustom = require('./errorCustom');
// const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  // logger.error('err');
  console.log(err);
  if (err instanceof ErrorCustom) {
    return res.status(err.code).json({ ok: false, errMsg: err.message });
  }

  return res.status(500).json({ ok: false, errMsg: err.message });
};
