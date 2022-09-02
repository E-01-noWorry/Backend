const logger = require('../config/winston');
const ErrorCustom = require('./errorCustom');

module.exports = (err, req, res, next) => {
  console.log(err);
  logger.error(err);
  if (err instanceof ErrorCustom) {
    return res.status(err.code).json({ ok: false, errMsg: err.message });
  }

  return res.status(500).json({ ok: false, errMsg: err.message });
};
