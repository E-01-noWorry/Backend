const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');

class ChatRepository {
  createChat = async (userKey, nickname, title, max, hashTag) => {
    const newRoom = await Room.create({
      max: max,
      hashTag: hashTag,
      title: title,
      userKey,
    });

    // Participant에 방금 생성한 유저 생성하고 바로 채팅방 안으로 들어가야함
    await Participant.create({
      userKey,
      roomKey: newRoom.roomKey,
    });

    return newRoom;
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

    return allRoom
  }

  inoutChat = async (userKey, nickname, roomKey) => {
    const room = await Room.findOne({
      where: { roomKey },
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Participant, attributes: ['userKey'] },
      ],
    });

    return room
  }

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

    return room
  }
  
  

}

module.exports = ChatRepository;
