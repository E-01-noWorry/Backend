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
    const myVotes = await this.mypageRepository.findAllVote(
      userKey,
      offset,
      limit
    );

    return myVotes;
  };

  myRoom = async (userKey, offset, limit) => {
    const myRooms = await this.mypageRepository.findAllRoom(
      userKey,
      offset,
      limit
    );

    return myRooms;
  };

  enterRoom = async (userKey, offset, limit) => {
    const enterRooms = await this.mypageRepository.findAllEnterRoom(
      userKey,
      offset,
      limit
    );

    return enterRooms;
  };
}

module.exports = MypageService;
