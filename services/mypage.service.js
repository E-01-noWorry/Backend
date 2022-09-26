const { Select, User, Vote, Room, Participant } = require('../models');

const MypageRepository = require('../repositories/mypage.repository');

class MypageService {
  mypageRepository = new MypageRepository();

  findUserInfo = async (userKey) => {
    const userInfo = await this.mypageRepository.findOneUser(userKey);

    return userInfo;
  };

  mySelect = async (userKey, offset, limit) => {
    const mySelects = await this.mypageRepository.findAllSelect(
      userKey,
      offset,
      limit
    );

    return mySelects;
  };

  myVote = async (userKey, offset, limit) => {
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

  myRoom = async (userKey, offset, limit) => {
    const myRooms = await Room.findAll({
      where: { userKey },
      include: [{ model: Participant, attributes: ['userKey'] }],
      order: [['roomKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return myRooms;
  };

  enterRoom = async (userKey, offset, limit) => {
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

module.exports = MypageService;
