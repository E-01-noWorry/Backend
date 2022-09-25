const { Select, User, Vote, Room, Participant } = require('../models');
const joi = require('../advice/joiSchema');

const MypageService = require('../services/mypage.service'); //

class MypageController {
  mypageService = new MypageService(); //

  getMypage = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const userInfo = await this.mypageService.findUserInfo(userKey);

      return res.status(200).json({
        ok: true,
        msg: '마이페이지 조회 성공',
        result: { point: userInfo.point },
      });
    } catch (err) {
      next(err);
    }
  };

  getMySelect = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      let offset = 0;
      const limit = 5;
      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }

      const mySelects = await this.mypageService.mySelect(
        userKey,
        offset,
        limit
      );

      res.status(200).json({
        msg: '내가 작성한 선택글 조회 성공',
        result: mySelects.map((e) => {
          return {
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.compeltion,
            nickname: nickname,
            options: e.options,
            total: e.Votes.length,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getIsVote = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      let offset = 0;
      const limit = 5;
      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }

      const myVotes = await this.mypageService.myVote(userKey, offset, limit);

      res.status(200).json({
        msg: '내가 투표한 선택글 조회 성공',
        result: myVotes.map((e) => {
          return {
            selectKey: e.Select.selectKey,
            title: e.Select.title,
            category: e.Select.category,
            deadLine: e.Select.deadLine,
            completion: e.Select.compeltion,
            nickname: e.Select.User.nickname,
            options: e.Select.options,
            total: e.Select.Votes.length,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getMyRoom = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      let offset = 0;
      const limit = 5;
      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }

      const myRooms = await this.mypageService.myRoom(userKey, offset, limit);

      return res.status(200).json({
        ok: true,
        msg: '내가 만든 채팅방 조회 성공',
        result: myRooms.map((e) => {
          return {
            roomKey: e.roomKey,
            title: e.title,
            max: e.max,
            currentPeople: e.Participants.length,
            hashTag: e.hashTag,
            host: nickname,
            userKey: e.userKey,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getEnterRoom = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      let offset = 0;
      const limit = 5;
      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }

      const enterRooms = await this.mypageService.enterRoom(
        userKey,
        offset,
        limit
      );

      return res.status(200).json({
        ok: true,
        msg: '내가 들어가있는 채팅방 조회 성공',
        result: enterRooms.map((e) => {
          return {
            roomKey: e.Room.roomKey,
            title: e.Room.title,
            max: e.Room.max,
            currentPeople: e.Room.Participants.length,
            hashTag: e.Room.hashTag,
            host: e.Room.User.nickname,
            userKey: e.Room.userKey,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = MypageController;
