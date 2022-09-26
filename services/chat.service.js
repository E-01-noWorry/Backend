const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');

class ChatService {
  createChat = async (userKey, nickname, title, max, hashTag) => {
    const newRoom = await Room.create({
      title,
      max,
      hashTag,
      userKey,
    });

    //     // Participant에 방금 생성한 유저 생성하고 바로 채팅방 안으로 들어가야함
    await Participant.create({
      userKey,
      roomKey: newRoom.roomKey,
    });

    //     //채팅방 생성시 +3점씩 포인트 지급
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

    return searchResult;
  };

  allChat = async (offset, limit) => {
    const allRoom = await Room.findAll({
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Participant, attributes: ['userKey'] },
      ],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return allRoom;
  };

  entranceChat = async (userKey, nickname, roomKey) => {
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

    return room;
  };

  leaveChet = async (userKey, nickname, roomKey) => {
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

    return room;
  };

  detailChat = async (userKey, nickname, roomKey) => {
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

    return room;
  };
}

module.exports = ChatService;
