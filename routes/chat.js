const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const { Room, Chat, User, Participant } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');

// 채팅방 생성
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { title, max, hashTag } = req.body;

    const newRoom = await Room.create({
      title,
      max,
      hashTag,
      userKey,
    });

    // Participant에 방금 생성한 유저 생성하고 바로 채팅방 안으로 들어가야함
    await Participant.create({
      userKey,
      roomKey: newRoom.roomKey,
    });

    return res.status(200).json({
      ok: true,
      msg: '채팅방 생성 성공',
      result: {
        roomKey: newRoom.roomKey,
        title: newRoom.title,
        max: newRoom.max,
        hashTag: newRoom.hashTag,
        nickname: nickname,
        userKey,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 채팅방 전체 조회
router.get('/', async (req, res, next) => {
  try {
    const allRoom = await Room.findAll({
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Participant, attributes: ['userKey'] },
      ],
      order: [['roomKey', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      msg: '채팅방 전체 조회 성공',
      result: allRoom.map((e) => {
        return {
          roomKey: e.roomKey,
          title: e.title,
          max: e.max,
          currentPeople: e.Participants.length,
          hashTag: e.hashTag,
          nickname: e.User.nickname,
          userKey: e.userKey,
        };
      }),
    });

    // let tags = []; //이 밑은 사람들이 태그 한것중 가장 많이 태그한 태그 3개를 가져와서 인기키워드로 보여주는 코드이다
    // for (let i = 0; i < allRoom.length; i++) {
    //   const room = allRoom[i];
    //   for (let l = 0; l < room.hashTag.length; l++) {
    //     const hashtag = room.hashTag[l];
    //     tags.push(hashtag);
    //   }
    // }

    // tags = tags.reduce((accu, curr) => {
    //   accu[curr] = (accu[curr] || 0) + 1;
    //   return accu;
    // }, {});
    // let max = 0;
    // let max2 = 0;
    // let max3 = 0;
    // for (let j = 0; j < Object.values(tags).length; j++) {
    //   if (max < Object.values(tags)[j]) {
    //     max = Object.values(tags)[j];
    //   }
    //   if (max2 < Object.values(tags)[j] < max) {
    //     max2 = Object.values(tags)[j];
    //   }
    //   if (max3 < Object.values(tags)[j] < max2) {
    //     max3 = Object.values(tags)[j];
    //   }
    // }
    // max = Object.keys(tags).find((key) => tags[key] === max);
    // delete tags[max];
    // max2 = Object.keys(tags).find((key) => tags[key] === max2);
    // delete tags[max2];
    // max3 = Object.keys(tags).find((key) => tags[key] === max3);
    // tags = [max, max2, max3];
  } catch (err) {
    next(err);
  }
});

// 채팅방 입장
// 호스트 유저는 방만들때 Participant에 생성했음
router.post('/:roomKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { roomKey } = req.params;

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
      const enterRoom = await Participant.create({
        userKey,
        roomKey: room.roomKey,
      });

      return res.status(200).json({
        ok: true,
        msg: '채팅방 입장 성공',
      });
    }
  } catch (err) {
    next(err);
  }
});

// 채팅방 나가기
// 나가는 유저가 호스트면 채팅방,채팅내용 삭제하고
// 일반유저면 참가자 명단에서만 삭제
router.delete('/:roomKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { roomKey } = req.params;

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

    if (userKey === room.userKey) {
      await Chat.destroy({ where: { roomKey } });
      await Participant.destroy({ where: { roomKey } });
      await Room.destroy({ where: { roomKey } });

      return res.status(200).json({
        ok: true,
        msg: '채팅방 호스트가 나가 채팅방이 삭제 됩니다.',
      });
      // 삭제니까 무슨 방 사라졌는지 줘야하나?
    } else {
      await Participant.destroy({ where: { userKey } });

      return res.status(200).json({
        ok: true,
        msg: '채팅방에서 나왔습니다.',
      });
    }
  } catch (err) {
    next(err);
  }
});

// 채팅방 상세조회(채팅방 정보, 참여 유저들 정보 보여주기)
router.get('/:roomKey', authMiddleware, async (req, res, next) => {
  try {
    const { userKey, nickname } = res.locals.user;
    const { roomKey } = req.params;

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

    const people = room.Participants.map((e) => {
      return { userKey: e.userKey, nickname: e.User.nickname };
    });

    const loadChat = await Chat.findAll({
      where: { roomKey },
      attributes: ['chat', 'userKey'],
    });

    return res.status(200).json({
      ok: true,
      msg: '채팅방 정보, 메세지 조회 성공',
      result: {
        roomKey: room.roomKey,
        title: room.title,
        max: room.max,
        hashTag: room.hashTag,
        nickname: room.User.nickname,
        userKey: room.userKey,
      },
      Participants: people,
      loadChat,
    });

    //

    // if (Room.roomUserId.includes(userId) || Room.hostId == userId) {
    //   //userId가 hostId거나 roomUserId에 존재한다면 조회해라
    //   loadChat = await Chats.findAll({ where: { roomId: Number(roomId) } });
    // }
    // let chatingRooms = await Room.findAll({
    //   //옆에 뜨는 내가 접속한 채팅방 목록인듯?
    //   where: {
    //     [Op.or]: [
    //       { roomId: Number(roomId) }, // 해당 roomId가 있거나
    //       { hostId: userId }, //host가 userId거나
    //       { roomUserId: { [Op.substring]: userId } }, //해당 방에 userId가 포함되있거나
    //     ],
    //   },
    // });

    // for (let i = 0; i < chatingRooms.length; i++) {
    //   //목록인데 자신이 지금 들어간 채팅방을 최상단에 위치하게 해주는 코드
    //   let chatRoom = chatingRooms[i];
    //   if (chatingRooms.roomId == roomId) {
    //     chatingRooms[i] = chatingRooms[0];
    //     chatingRooms[0] = chatRoom;
    //   }
    // }

    // res.status(200).send({
    //   msg: '룸 상세조회에 성공했습니다',
    //   chatingRooms,
    //   Room,
    //   loadChat,
    // }); //들어가있는 방 목록, 현재 접속 방, 채팅 정보를 보낸다
  } catch (err) {
    next(err);
  }
});

//미들웨어 쪽은 일단 추후에..ddddd

// //룸 검색 검색은 title, hashtag 정보 둘 중하나라도 있으면 검색된다
// router.get('/search', async (req, res) => {
//   const queryData = req.query;
//   const searchResult = await searchRoom.findAll({
//     where: {
//       [Op.or]: [
//         //substring은 sql의 like문법으로 앞뒤다짜르고 검색한 값만 가져옴
//         { title: { [Op.substring]: queryData.search } },
//         { hashTag: { [Op.substring]: queryData.search } },
//       ],
//     },
//     order: [
//       //검색한 값이 존재한다면 결과값 생성 순서대로 내림차순 정렬
//       [{ title: { [Op.substring]: queryData.search } }, 'cretedAt', 'DESC'],
//     ],
//   });
//   res.status(200).send({ msg: '룸 검색완료', searchResult });
// });

// //룸 해쉬태그 검색, 해쉬태그를 클릭하면 해당 해쉬태그가 포함된 채팅방만 보여줌
// router.get('/search/hashTag', async (req, res) => {
//   const queryData = req.query;
//   const rooms = await Room.findAll({
//     where: {
//       hashTag: { [Op.substring]: queryData.search },
//     },
//     order: [['cretedAt', 'DESC']],
//   });
//   res.status(200).send({ msg: '룸 해쉬태그 검색완료', rooms });
// });

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
