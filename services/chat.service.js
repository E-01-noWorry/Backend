const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');
const dayjs = require('dayjs');


const ChatRepository = require('../repositories/chat.repository');

class ChatService {
  chatRepository = new ChatRepository();

  createChat = async (userKey, nickname, title, max, hashTag) => {
    const newRoom = await this.chatRepository.createChat(
      userKey,
      nickname,
      title,
      max,
      hashTag
    );

    //채팅방 생성시 +3점씩 포인트 지급
    let roomPoint = await User.findOne({ where: { userKey } });
    await roomPoint.update({ point: roomPoint.point + 3 });

    return {
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
    };
  };

  searchChat = async (searchWord) => {
    const searchResult = await this.chatRepository.searchChat(searchWord);

    if (!searchWord) {
      throw new ErrorCustom(400, '검색어를 입력해주세요.');
    }

    if (searchResult.length == 0) {
      throw new ErrorCustom(400, '키워드와 일치하는 검색결과가 없습니다.');
    }

    return searchResult;
  };

  allChat = async (offset, limit) => {
    const allRoom = await this.chatRepository.allChat(offset, limit);
    return allRoom;
  };

  entranceChat = async (userKey, nickname, roomKey) => {
    const room = await this.chatRepository.inoutChat(
      userKey,
      nickname,
      roomKey
    );

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
      await Participant.create({
        userKey,
        roomKey: room.roomKey,
      });
    }
    return room;
  };

  leaveChet = async (userKey, nickname, roomKey) => {
    const room = await this.chatRepository.inoutChat(
      userKey,
      nickname,
      roomKey
    );

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
    }

    return room;
  };

  detailChat = async (userKey, nickname, roomKey) => {
    const room = await this.chatRepository.detailChat(userKey, nickname, roomKey)

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

    return {
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
    };
  };
}

module.exports = ChatService;
