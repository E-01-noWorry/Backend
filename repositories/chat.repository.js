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

  createParticipant = async (userKey, newRoom) => {
    const createParticipant = await Participant.create({
      userKey,
      roomKey: newRoom.roomKey,
    });

    return createParticipant;
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

  loadChats = async (roomKey) => {
    const loadChats = await Chat.findAll({
      where: { roomKey },
      attributes: ['chat', 'userKey', 'createdAt'],
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return loadChats;
  };
}

module.exports = ChatRepository;
