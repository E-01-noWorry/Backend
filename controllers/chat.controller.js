const joi = require('../advice/joiSchema');
const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');
const dayjs = require('dayjs');

class ChatController {
  postChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const result = joi.chatSchema.validate(req.body);
      if (result.error) {
        throw new ErrorCustom(400, '제목을 입력해주세요.');
      }
      const { title, max, hashTag } = result.value;
  
      const newRoom = await Room.create({
        title,
        max,
        hashTag,
        userKey,
      });
  
      // Participant에 방금 생성한 유저 생성하고 바로 채팅방 안으로 들어가야함
      await Participant.create({
        userKey,
        roomKey: newRoom.roomKey,
      });
  
      //채팅방 생성시 +3점씩 포인트 지급
      let roomPoint = await User.findOne({ where: { userKey } });
      await roomPoint.update({ point: roomPoint.point + 3 });
  
      return res.status(200).json({
        ok: true,
        msg: '채팅방 생성 성공',
        result: {
          roomKey: newRoom.roomKey,
          title: newRoom.title,
          max: newRoom.max,
          currentPeople: 1,
          hashTag: newRoom.hashTag,
          host: nickname,
          userKey,
          roomPoint: roomPoint.point,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  searchChat = async (req, res, next) => {
    try {
      const { searchWord } = joi.searchSchema.validate(req.query).value;
  
      const searchResult = await Room.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${searchWord}%` } },
            { hashTag: { [Op.substring]: `%${searchWord}%` } },
          ],
        },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Participant, attributes: ['userKey'] },
        ],
        order: [['roomKey', 'DESC']],
      });
  
      if (!searchWord) {
        throw new ErrorCustom(400, '검색어를 입력해주세요.');
      }
  
      if (searchResult.length == 0) {
        throw new ErrorCustom(400, '키워드와 일치하는 검색결과가 없습니다.');
      }
  
      return res.status(200).json({
        ok: true,
        msg: '채팅방 검색 조회 성공',
        result: searchResult.map((e) => {
          return {
            roomKey: e.roomKey,
            title: e.title,
            max: e.max,
            currentPeople: e.Participants.length,
            hashTag: e.hashTag,
            host: e.User.nickname,
            userKey: e.userKey,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  }

  allChat = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;
  
      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }
  
      const allRoom = await Room.findAll({
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Participant, attributes: ['userKey'] },
        ],
        order: [['roomKey', 'DESC']],
        offset: offset,
        limit: limit,
      });
  
      return res.status(200).json({
        ok: true,
        msg: '채팅방 전체 조회 성공',
        result: allRoom.map((e) => {
          return {
            roomKey: e.roomKey,
            title: e.title,
            max: e.max,
            currentPeople: e.Participants.length,
            hashTag: e.hashTag,
            host: e.User.nickname,
            userKey: e.userKey,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  }

  entranceChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;
  
      const room = await Room.findOne({
        where: { roomKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Participant, attributes: ['userKey'] },
        ],
      });
  
      if (!room) {
        throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
      }
  
      const users = room.Participants.map((e) => {
        return e.userKey;
      });
  
      if (users.includes(userKey)) {
        return res.status(200).json({
          ok: true,
          msg: '채팅방 입장 성공',
        });
      }
  
      if (room.Participants.length >= room.max) {
        throw new ErrorCustom(400, '입장 가능 인원을 초과했습니다.');
      } else {
        const enterRoom = await Participant.create({
          userKey,
          roomKey: room.roomKey,
        });
  
        return res.status(200).json({
          ok: true,
          msg: '채팅방 입장 성공',
        });
      }
    } catch (err) {
      next(err);
    }
  }

  leaveChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;
  
      const room = await Room.findOne({
        where: { roomKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Participant, attributes: ['userKey'] },
        ],
      });
  
      if (!room) {
        throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
      }
  
      if (userKey === room.userKey) {
        await Room.destroy({ where: { roomKey } });
  
        return res.status(200).json({
          ok: true,
          msg: '채팅방 호스트가 나가 채팅방이 삭제 됩니다.',
        });
      } else {
        await Participant.destroy({ where: { userKey, roomKey } });
  
        return res.status(200).json({
          ok: true,
          msg: '채팅방에서 나왔습니다.',
        });
      }
    } catch (err) {
      next(err);
    }
  }

  detailChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;
  
      const room = await Room.findOne({
        where: { roomKey },
        include: [
          { model: User, attributes: ['nickname'] },
          {
            model: Participant,
            attributes: ['userKey'],
            include: [{ model: User, attributes: ['nickname'] }],
          },
        ],
      });
  
      if (!room) {
        throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
      }
  
      const people = room.Participants.map((e) => {
        return { userKey: e.userKey, nickname: e.User.nickname };
      });
  
      const loadChats = await Chat.findAll({
        where: { roomKey },
        attributes: ['chat', 'userKey', 'createdAt'],
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      });
  
      return res.status(200).json({
        ok: true,
        msg: '채팅방 정보, 메세지 조회 성공',
        result: {
          roomKey: room.roomKey,
          title: room.title,
          max: room.max,
          currentPeople: room.Participants.length,
          hashTag: room.hashTag,
          host: room.User.nickname,
          userKey: room.userKey,
        },
        Participants: people,
        loadChat: loadChats.map((l) => {
          return {
            chat: l.chat,
            userKey: l.userKey,
            createdAt: dayjs(l.createdAt).add(15, 'h').format(),
            User: {
              nickname: l.User.nickname,
              point: l.User.point,
            },
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatController;
