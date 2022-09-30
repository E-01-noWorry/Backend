class ErrorCustom extends Error {
  constructor(code, message, ...params) {
    super(...params);

    this.code = code;
    this.message = message;
  }
}

module.exports = ErrorCustom;
