const joi = require('../advice/joiSchema');
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

      const newRoom = await this.chatService.createChat(
        userKey,
        title,
        max,
        hashTag
      );

      return res.status(200).json({
        ok: true,
        msg: '채팅방 생성 성공',
        result: {
          roomKey: newRoom.roomKey,
          title,
          max,
          currentPeople: 1,
          hashTag,
          host: nickname,
          userKey,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  searchChat = async (req, res, next) => {
    try {
      const { searchWord } = joi.searchSchema.validate(req.query).value;

      if (!searchWord) {
        throw new ErrorCustom(400, '검색어를 입력해주세요.');
      }

      const searchResults = await this.chatService.searchChat(searchWord);

      return res.status(200).json({
        ok: true,
        msg: '채팅방 검색 조회 성공',
        result: searchResults.map((e) => {
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
      const user = res.locals.user;
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const allRooms = await this.chatService.allChat(offset, limit);

      const isRoom = await this.chatService.isRoom(user);

      return res.status(200).json({
        ok: true,
        msg: '채팅방 전체 조회 성공',
        result: allRooms.map((e) => {
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
        isRoom,
      });
    } catch (err) {
      next(err);
    }
  };

  entranceChat = async (req, res, next) => {
    try {
      const { userKey } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.entranceChat(userKey, roomKey);

      return res.status(200).json({
        ok: true,
        msg: '채팅방 입장 성공',
        result: {
          roomKey: room.roomKey,
          title: room.title,
          max: room.max,
          currentPeople: room.Participants.length,
          hashTag: room.hashTag,
          host: room.User.nickname,
          userKey: room.userKey,
          point: room.User.point,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  leaveChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.leaveChet(userKey, nickname, roomKey);

      return res.status(200).json({
        ok: true,
        msg: room,
      });
    } catch (err) {
      next(err);
    }
  };

  detailChat = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { roomKey } = joi.roomKeySchema.validate(req.params).value;

      const room = await this.chatService.detailChat(roomKey, nickname);

      const people = await this.chatService.enterPeople(room);

      const loadChats = await this.chatService.loadChats(roomKey, nickname);

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
