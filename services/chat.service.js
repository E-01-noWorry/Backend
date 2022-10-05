const ErrorCustom = require('../advice/errorCustom');
const dayjs = require('dayjs');

const ChatRepository = require('../repositories/chat.repository');

class ChatService {
  chatRepository = new ChatRepository();

  createChat = async (userKey, nickname, title, max, hashTag) => {
    const newRoom = await this.chatRepository.createChat(
      userKey,
      title,
      max,
      hashTag
    );

    await this.chatRepository.incrementPoint(userKey);

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
      },
    };
  };

  searchChat = async (searchWord) => {
    const searchResults = await this.chatRepository.findAllSearchWord(
      searchWord
    );

    if (searchResults.length == 0) {
      throw new ErrorCustom(400, '키워드와 일치하는 검색결과가 없습니다.');
    }

    return searchResults;
  };

  allChat = async (offset, limit) => {
    const allRooms = await this.chatRepository.findAllRoom(offset, limit);

    return allRooms;
  };

  isRoom = async (user) => {
    if (!user) {
      return [];
    } else {
      const userKey = user.userKey;

      const enterRoom = await this.chatRepository.findAllEnter(userKey);

      let isRoom = enterRoom.map((e) => {
        return e.roomKey;
      });

      return isRoom;
    }
  };

  entranceChat = async (userKey, roomKey) => {
    const room = await this.chatRepository.findOneRoom(roomKey);

    if (!room) {
      throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
    }

    if (room.blackList.includes(userKey)) {
      throw new ErrorCustom(400, '강퇴 당한 방에는 입장이 불가능 합니다.');
    }

    const users = room.Participants.map((e) => {
      return e.userKey;
    });

    if (users.includes(userKey)) {
      return room;
    }

    if (room.Participants.length >= room.max) {
      throw new ErrorCustom(400, '입장 가능 인원을 초과했습니다.');
    }

    return room;
  };

  leaveChet = async (userKey, nickname, roomKey) => {
    const room = await this.chatRepository.findOneRoom(roomKey);

    if (!room) {
      throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
    }

    if (userKey === room.userKey) {
      await this.chatRepository.delRoom(roomKey);

      return {
        ok: true,
        msg: '채팅방 호스트가 나가 채팅방이 삭제 됩니다.',
      };
    } else {
      await this.chatRepository.delParticipant(userKey, roomKey);

      return {
        ok: true,
        msg: '채팅방에서 나왔습니다.',
      };
    }
  };

  detailChat = async (roomKey, nickname) => {
    const room = await this.chatRepository.detailChat(roomKey);

    if (!room) {
      throw new ErrorCustom(400, '해당 채팅방이 존재하지 않습니다.');
    }

    const people = room.Participants.map((e) => {
      return { userKey: e.userKey, nickname: e.User.nickname };
    });

    const loadChats = await this.chatRepository.loadChats(roomKey, nickname);

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
