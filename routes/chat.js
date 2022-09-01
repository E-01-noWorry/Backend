const router = require('.');
const { Room, Chat, sequelize, Sequelize } = require('../modles');
const { Op } = Sequelize.Op;

//미들웨어 쪽은 일단 추후에..

//룸 검색 검색은 title, hashtag 정보 둘 중하나라도 있으면 검색된다
router.get('/search', async (req, res) => {
  const queryData = req.query;
  const searchResult = await searchRoom.findAll({
    where: {
      [Op.or]: [
        //substring은 sql의 like문법으로 앞뒤다짜르고 검색한 값만 가져옴
        { title: { [Op.substring]: queryData.search } },
        { hashTag: { [Op.substring]: queryData.search } },
      ],
    },
    order: [
      //검색한 값이 존재한다면 결과값 생성 순서대로 내림차순 정렬
      [{ title: { [Op.substring]: queryData.search } }, 'cretedAt', 'DESC'],
    ],
  });
  res.status(200).send({ msg: '룸 검색완료', searchResult });
});

//룸 해쉬태그 검색, 해쉬태그를 클릭하면 해당 해쉬태그가 포함된 채팅방만 보여줌
router.get('/search/hashTag', async (req, res) => {
  const queryData = req.query;
  const rooms = await Room.findAll({
    where: {
      hashTag: { [Op.substring]: queryData.search },
    },
    order: [['cretedAt', 'DESC']],
  });
  res.status(200).send({ msg: '룸 해쉬태그 검색완료', rooms });
});

//룸 채팅 불러오기
router.get('/chat/:roomId', async (req, res) => {
  try {
    const { postId } = req.params;

    const Chats = await Chats.findAll({
      where: { postId: postId },
      order: [['cretedAt', 'DESC']],
    });
    res.status(200).send({ Chats, msg: '채팅을 불러왔습니다' });
  } catch {
    res.status(400).send({ msg: '채팅을 불러오지 못했습니다.' });
  }
});

//룸 전체 조회
router.get('/', async (req, res) => {
  try {
    const allRoom = await Room.findAll({ order: [['createdAt', 'DESC']] }); //사실상 전체조회는 이 코드가 다임

    let tags = []; //이 밑은 사람들이 태그 한것중 가장 많이 태그한 태그 3개를 가져와서 인기키워드로 보여주는 코드이다
    for (let i = 0; i < allRoom.length; i++) {
      const room = allRoom[i];
      for (let l = 0; l < room.hashTag.length; l++) {
        const hashtag = room.hashTag[l];
        tags.push(hashtag);
      }
    }

    tags = tags.reduce((accu, curr) => {
      accu[curr] = (accu[curr] || 0) + 1;
      return accu;
    }, {});
    let max = 0;
    let max2 = 0;
    let max3 = 0;
    for (let j = 0; j < Object.values(tags).length; j++) {
      if (max < Object.values(tags)[j]) {
        max = Object.values(tags)[j];
      }
      if (max2 < Object.values(tags)[j] < max) {
        max2 = Object.values(tags)[j];
      }
      if (max3 < Object.values(tags)[j] < max2) {
        max3 = Object.values(tags)[j];
      }
    }
    max = Object.keys(tags).find((key) => tags[key] === max);
    delete tags[max];
    max2 = Object.keys(tags).find((key) => tags[key] === max2);
    delete tags[max2];
    max3 = Object.keys(tags).find((key) => tags[key] === max3);
    tags = [max, max2, max3];

    return res.status(200).send({ allRoom, tags, msg: '룸을 조회했습니다' });
  } catch (err) {
    return res.status(400).send({ msg: '룸 조회가 되지 않았습니다.' });
  }
});

//룸 상세조회
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId, nickname, userImageURL } = res.locals;
  try {
    let Room = await Room.findOne({ where: { roomId: Number(roomId) } });
    let loadChat = [];

    if (Room.roomUserId.includes(userId) || Room.hostId == userId) {
      //userId가 hostId거나 roomUserId에 존재한다면 조회해라
      loadChat = await Chats.findAll({ where: { roomId: Number(roomId) } });
    }
    let chatingRooms = await Rooms.findAll({
      //옆에 뜨는 내가 접속한 채팅방 목록인듯?
      where: {
        [Op.or]: [
          { roomId: Number(roomId) }, // 해당 roomId가 있거나
          { hostId: userId }, //host가 userId거나
          { roomUserId: { [Op.substring]: userId } }, //해당 방에 userId가 포함되있거나
        ],
      },
    });

    for (let i = 0; i < chatingRooms.length; i++) {
      //목록인데 자신이 지금 들어간 채팅방을 최상단에 위치하게 해주는 코드
      let chatRoom = chatingRooms[i];
      if (chatingRooms.roomId == roomId) {
        chatingRooms[i] = chatingRooms[0];
        chatingRooms[0] = chatRoom;
      }
    }

    res.status(200).send({
      msg: '룸 상세조회에 성공했습니다',
      chatingRooms,
      Room,
      loadChat,
    }); //들어가있는 방 목록, 현재 접속 방, 채팅 정보를 보낸다
  } catch (err) {
    res.status(400).send({
      msg: '룸 상세조회에 실패했습니다',
      chatingRooms,
      Room,
      loadChat,
    });
  }
});

//채팅방 생성
router.post('/', async (req, res) => {
  try {
    const { title, max, hashTag } = req.body; //제목, 최대인원, 해쉬태그 정보 받아온다
    const { userId, nickname, userImageURL } = res.locals;
    const existRoom = await Room.findOne({
      where: { title: title },
    });

    if (existRoom) {
      return res.status(400).send({ msg: '이미 존재하는 방이름입니다.' });
    }

    const newRoom = await Room.create({
      max: max,
      hashTag: hashTag,
      title: title,
      hostNickname: nickname,
      hostId: userId,
      hostImg: userImageURL,
      createdAt: Date(),
      updatedAt: Date(),
      roomUserId: [], //roomUser정보는 여러 명이 들어올수있으니 배열로 만들어서 여러개를 저장할 수 있게한다
      roomUserNickname: [],
      roomUserNum: 1,
      roomUserImg: [],
    });

    return res.status(200).send({ msg: '완료', newRoom });
  } catch (err) {
    res.status(400).send({ msg: '룸 생성에 실패했습니다.' });
  }
});

//채팅방 입장
router.post('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = res.locals;

  let room = await Room.findOne({ where: { roomId: Number(roomId) } });

  try {
    if (room.hostId == userId) {
      res.status(200).send({ msg: '호스트가 입장했습니다.' });
      return;
    }
    if (room.roomUsersId.includes(userId)) {
      res.status(200).send({ msg: '채팅방에 등록된 유저입니다.' });
      return;
    }
    if (Number(room.max) < room.roomUserId.length) {
      res.status(400).send({ errorMEssage: '입장 가능 인원을 초과했습니다.' });
      return;
    }

    res.status(201).send({ msg: '입장 완료' });
  } catch (err) {
    res.status(400).send({ errorMEssage: '채팅방 입장에 실패했습니다.' });
    return;
  }
});

//채팅방 나가기
//나가는 유저가 호스트면 채팅방,채팅내용 삭제하고
//아니면 filter로 나간 유저만 걸러내고 room정보 업대이트 한다
router.delete('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId, nickname, userImgURL } = res.locals.user;

  const room = await Room.findOne({ where: { roomId: Number(roomId) } });

  if (userId === room.hostId) {
    await Chat.destory({ roomId: roomId });
    await Room.destory({ roomId: roomId });
  } else {
    //해당userId, nickname, userImgURL이 아닌 것들만 남긴다
    const roomUsersId = room.roomuserId.filter(
      (roomUsersId) => roomUsersId != userId
    );
    const roomUsersNickname = room.roomUserNickname.filter(
      (roomUserNickname) => roomUserNickname != nickname
    );
    const roomUsersImg = room.roomUsersImg.filter(
      (roomUsersImg) => roomUsersImg != userImgURL
    );
    const roomUserNum = roomUsersId.length + 1;
    await room.update({
      roomuserId: roomUsersId,
      roomUserNickname: roomUsersNickname,
      roomUserImg: roomUsersImg,
      roomUserNum: roomUserNum,
    });
  }
});

//채팅방 인기순 정렬 (채팅방 인원많은 순으로)
router.get('/search/populer', async (req, res) => {
  try {
    const allRoom = await Room.findAll();
    allRoom.sort((a, b) => b.roomUserId.length - a.roomUserId.length);

    return res.status(200).send({ allRoom, msg: '인기룸을 조회했습니다' });
  } catch (err) {
    return res.status(400).send({ msg: '인기룸을 조회가 되지않았습니다' });
  }
});

module.exports = router;
