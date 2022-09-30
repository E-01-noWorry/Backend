const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');

class ChatRepository {
  createChat = async (userKey, title, max, hashTag) => {
    const newRoom = await Room.create({
      userKey,
      title,
      max,
      hashTag,
    });

    return newRoom;
  };

  incrementPoint = async (userKey) => {
    const incrementPoint = await User.increment(
      { point: 3 },
      { where: { userKey } }
    );

    return incrementPoint;
  };

  findAllSearchWord = async (searchWord) => {
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

  findAllEnter = async (userKey) => {
    const findAllEnter = await Participant.findAll({ where: { userKey } });

    return findAllEnter;
  };

  findAllRoom = async (offset, limit) => {
    const findAllRoom = await Room.findAll({
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Participant, attributes: ['userKey'] },
      ],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return findAllRoom;
  };

  findOneRoom = async (roomKey) => {
    const findOneRoom = await Room.findOne({
      where: { roomKey },
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Participant, attributes: ['userKey'] },
      ],
    });

    return findOneRoom;
  };

  delRoom = async (roomKey) => {
    const delRoom = await Room.destroy({ where: { roomKey } });

    return delRoom;
  };

  delParticipant = async (userKey, roomKey) => {
    const delParticipant = await Participant.destroy({
      where: { userKey, roomKey },
    });

    return delParticipant;
  };

  detailChat = async (roomKey) => {
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

    return room;
  };

  loadChats = async (roomKey, nickname) => {
    const firstChat = await Chat.findOne({
      where: { roomKey, chat: `${nickname}님이 입장했습니다.` },
    });

    if (!firstChat) {
      return [];
    }

    const chatTime = new Date(firstChat.createdAt).setHours(
      new Date(firstChat.createdAt).getHours() - 9
    );

    const loadChats = await Chat.findAll({
      where: {
        roomKey,
        createdAt: {
          [Op.gte]: chatTime,
        },
      },
      attributes: ['chat', 'userKey', 'createdAt'],
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return loadChats;
  };
}

module.exports = ChatRepository;
