const express = require('express');
const router = express.Router();

const selectRouter = require('./select');
const userRouter = require("./user")

router.use('/select', selectRouter);
router.use("/", userRouter);

module.exports = router;
