const { Select, User, Vote, Room, Participant } = require('../models');

class MypageRepository {
  findOneUser = async (userKey) => {
    const userInfo = await User.findOne({ where: { userKey } });

    return userInfo;
  };

  findAllSelect = async (userKey, offset, limit) => {
    const mySelects = await Select.findAll({
      where: { userKey },
      include: [{ model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return mySelects;
  };

  findAllVote = async (userKey, offset, limit) => {
    const myVotes = await Vote.findAll({
      where: { userKey },
      include: [
        {
          model: Select,
          include: [
            { model: User, attributes: ['nickname'] },
            { model: Vote, attributes: ['choice'] },
          ],
        },
      ],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return myVotes;
  };

  findAllRoom = async (userKey, offset, limit) => {
    const myRooms = await Room.findAll({
      where: { userKey },
      include: [{ model: Participant, attributes: ['userKey'] }],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return myRooms;
  };

  findAllEnterRoom = async (userKey, offset, limit) => {
    const enterRooms = await Participant.findAll({
      where: { userKey },
      include: [
        {
          model: Room,
          include: [
            { model: User, attributes: ['nickname'] },
            { model: Participant },
          ],
        },
      ],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return enterRooms;
  };
}

module.exports = MypageRepository;
