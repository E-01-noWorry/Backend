const joi = require('joi');

const userIdRegEx = /^[A-Za-z0-9]{6,20}$/;
const nicknameRegEx = /^[가-힣,A-Za-z0-9]{2,10}$/;
const passwordRegEx = /^[A-Za-z0-9]{6,20}$/;

exports.userSchema = joi.object({
  userId: joi.string().pattern(userIdRegEx).required(),
  nickname: joi.string().pattern(nicknameRegEx).required(),
  password: joi.string().pattern(passwordRegEx).required(),
  confirm: joi.string(),
});

exports.selectSchema = joi.object({
  title: joi.string().max(40).required(),
  category: joi.string().required(),
  time: joi.number().required(),
  options: joi.string().required(),
});

exports.commentSchema = joi.object({
  comment: joi.string().max(50).required(),
});

exports.recommentSchema = joi.object({
  comment: joi.string().required(),
});

exports.chatSchema = joi.object({
  title: joi.string().max(20).required(),
  max: joi.number().required(),
  hashTag: joi.array(),
});
