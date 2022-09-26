const joi = require('../advice/joiSchema');
const { Room, Chat, User, Participant } = require('../models');
const ErrorCustom = require('../advice/errorCustom');
const dayjs = require('dayjs');

const ChatService = require('../services/chat.service');

class ChatController {
  chatService = new ChatService();

  postChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const result = joi.chatSchema.validate(req.body);
      if (result.error) {
        throw new ErrorCustom(400, '제목을 입력해주세요.');
      }
      const { title, max, hashTag } = result.value;

      const newRoom = await this.chatService.createChat(userKey, title, max, hashTag)

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
          roomPoint: newRoom.point,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  searchChat = async (req, res, next) => {
    try {
      const { searchWord } = joi.searchSchema.validate(req.query).value;

      const searchResult = await this.chatService.searchChat(searchWord);

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
  };

  allChat = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1); //5 10
      }

      const allRoom = await this.chatService.allChat(offset);

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
  };

  entranceChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.entranceChat(
        userKey,
        nickname,
        roomKey
      );

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
        await Participant.create({
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
  };

  leaveChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.leaveChet(
        userKey,
        nickname,
        roomKey
      );

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
  };

  detailChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.detailChat(
        userKey,
        nickname,
        roomKey
      );

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
  };
}

module.exports = ChatController;
