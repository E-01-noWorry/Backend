class ErrorCustom extends Error {
  constructor(code, message, ...params) {
    super(...params);

    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, ErrorCustom);
    // }

    this.code = code;
    this.message = message;
  }
}

module.exports = ErrorCustom;
