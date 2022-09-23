const { Select, User, Vote, Room, Participant } = require('../models');

class MypageController {
  getMypage = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const user = await User.findOne({ where: { userKey } });

      return res.status(200).json({
        ok: true,
        msg: '마이페이지 조회 성공',
        result: { point: user.point },
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = MypageController;
