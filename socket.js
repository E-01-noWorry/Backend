// const app = require('./app');
const socket = require('socket.io');
// const http = require('http');
const { Room, Chat, User, Participant } = require('./models');
// require('socket.io-client')('https://localhost:3000');
// const server = http.createServer(app);
const dayjs = require('dayjs');

// ------------------채팅 소캣 부분만 한번 만져봄(여기서부터) ----------------

module.exports = (server, app) => {
  const io = socket(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  app.set('socket.io', io);

  // 소캣 연결
  io.on('connection', (socket) => {
    console.log('a user connected');

    // 채팅방 목록? 접속(입장전)
    socket.on('join-room', async (data) => {
      let { roomKey, userKey } = data;
      const enterUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title'] },
        ],
      });

      // 해당 채팅방 입장
      socket.join(enterUser.Room.title);

      // 지금은 api에서 참가자 디비를 만들어서 입장을 하고 Chat에서 처음인지 재방문인지 확인하는데
      // api에서 참가자 디비를 만들지 않고, 소캣통신에 들어오고나서 참가자 정보 유무로 처음인지 재방문인지 확인하고 참가자를 만든다면, 방대한 Chat에 접근 안해도됨+입장퇴장메세지 잘보여줌
      // 하지만 위와 같이 하면 결국 채팅방title, 유저nickname을 알기위해 추가적으로 디비테이블에 접근을 해야하는 문제가 생김(무엇이 더 효율적일까?)
      const enterMsg = await Chat.findOne({
        where: {
          roomKey,
          userKey: 12,
          chat: `${enterUser.User.nickname}님이 입장했습니다.`,
        },
      });

      // 처음입장이라면 환영 메세지가 없을테니
      if (!enterMsg) {
        await Chat.create({
          roomKey,
          userKey: 12, // 관리자 유저키
          chat: `${enterUser.User.nickname}님이 입장했습니다.`,
        });

        // 관리자 환영메세지 보내기
        let param = { nickname: enterUser.User.nickname };
        io.to(enterUser.Room.title).emit('welcome', param);
      } else {
        // 재입장이라면 아무것도 없음
      }
    });

    // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
    socket.on('chat_message', async (data) => {
      let { message, roomKey, userKey } = data;
      const now = dayjs();

      const newChat = await Chat.create({
        roomKey,
        userKey,
        chat: message,
        createdAt: now.format()
      });
      const chatUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title'] },
        ],
      });

      // 채팅 보내주기
      let param = {
        message,
        roomKey,
        userKey: chatUser.userKey,
        nickname: chatUser.User.nickname,
        time: newChat.createdAt, // (9시간 차이나는 시간)
      };

      io.to(chatUser.Room.title).emit('message', param);
    });

    // 채팅방 나가기(채팅방에서 아에 퇴장)
    socket.on('leave-room', async (data) => {
      let { roomKey, userKey } = data;
      const leaveUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title', 'userKey'] },
        ],
      });

      // 호스트가 나갔을 때
      if (userKey === leaveUser.Room.userKey) {
        let param = { nickname: leaveUser.User.nickname };
        socket.broadcast.to(leaveUser.Room.title).emit('byeHost', param);
      } else {
        // 일반유저가 나갔을 때(호스트X)
        await Chat.create({
          roomKey,
          userKey: 12, // 관리자 유저키
          chat: `${leaveUser.User.nickname}님이 퇴장했습니다.`,
        });
        // await Chat.destroy({
        //   where: {
        //     roomKey,
        //     userKey: 12, // 관리자 유저키
        //     chat: `${leaveUser.User.nickname}님이 입장했습니다.`,
        //   },
        // });
        let param = { nickname: leaveUser.User.nickname };
        io.to(leaveUser.Room.title).emit('bye', param);
      }
    });

    // 채팅방의 사람들 정보 주기
    socket.on('showUsers', async (data) => {
      let { roomKey, userKey } = data;
      const allUsers = await Participant.findAll({
        where: { roomKey },
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      });

      let param = allUsers.map((e) => {
        return {
          userKey: e.userKey,
          nickname: e.User.nickname,
          point: e.User.point,
        };
      });
      io.to(userKey).emit('showUsers', param);
    });

    // 추천하기
    socket.on('recommend', async (data) => {
      // 여기서 유저키는 추천 받은 사람의 유저키
      let { roomKey, userKey } = data;
      const recommendUser = await User.findOne({ where: { userKey } });
      await recommendUser.update({ point: recommendUser.point + 3 });

      let param = { msg: '호스트로 부터 추천을 받았습니다.' };
      io.to(userKey).emit('recommend', param);
    });
  });
};

// ------------------채팅 소캣 부분만 한번 만져봄(여기까지) ----------------

// module.exports = (server, app) => {
//   const io = require('socket.io')(server, {
//     cors: {
//       origin: ['http://', '*', 'https://'],
//       credentials: true,
//     },
//   });
//   app.set('io', io);
//   io.on('connection', (socket) => {
//     //서버에 연결되면 아래 코드 실행
//     //채팅방 접속시
//     socket.on('join-room', async (roomId, userId) => {
//       const enterRoom = await Room.findOne({
//         where: { rommId: roomId },
//       });
//       const enterUser = await users.findOne({
//         where: { userId: userId },
//       });
//       const entermsg = await Chat.findOne({
//         where: {
//           roomId: roomId,
//           chat: enterUser.dataValues.nickname + '님이 입장하셨습니다.',
//         },
//       });
//       socket.join(enterRoom.title);
//       if (!entermsg) {
//         await Chat.create({
//           userNickname: 'system',
//           userId: 'system',
//           roomId: roomId,
//           chat: enterUser.dataValues.nickname + '님이 입장하셨습니다.',
//           userImg: null,
//         });
//       }

//       // 기존에없는 새로운 유저가 접속하면 정보를 저장하고 room정보 업데이트
//       if (
//         enterRoom.dataValues.hostId != Number(userId) &&
//         !enterRoom.datavalues.roomUserId.includes(Number(userId))
//       ) {
//         let UserImageURL = await images.findOne({
//           attributes: ['userImageURL'],
//           where: { userId: userId },
//         });
//         enterRoom.roomUserId.push(Number(userId));
//         enterRoom.roomUserNickname.push(enterUser.dataValues.nickname);
//         let roomUserNum = enterRoom.roomUserNickname.length + 1;
//         enterRoom.roomUserImg.push(UserImageURL.userImageURL);

//         await Room.update(
//           {
//             roomUserId: enterRoom.dataValues.roomUserId,
//             roomUserImg: enterRoom.dataValues.roomUserImg,
//             roomUserNickname: enterRoom.dataValues.roomUserNickname,
//             roomUserNum: roomUserNum,
//           },
//           { where: { roomId: roomId } }
//         );
//       }
//       socket.to(enterRoom.title).emit('welcome', enterUser.dataValues.nickname);
//     });

//     //채팅 정보
//     socket.on('chat_message', async (messageChat, userId, roomId) => {
//       const chatUser = await users.findOne({ where: { userId: userId } });
//       const userImg = await images.findOne({ where: { userId: userId } });
//       const room = await Room.findOne({ where: { roomId: roomId } });
//       await Chat.create({
//         userNickname: chatUser.dataValues.nickname,
//         useId: userId,
//         roomId: roomId,
//         chat: messageChat,
//         userImg: userImg.dataValues.userImageURL,
//       });

//       socket
//         .to(room.title)
//         .emit(
//           'message',
//           messageChat,
//           chatUser.dataValues.nickname,
//           userImg.dataValues.userImageURL,
//           roomId
//         );
//     });

//     //채팅방 나가기
//     socket.on('leave-room', async (roomId, userId) => {
//       const leaveRoom = await Room.findOne({
//         where: { roomId: roomId },
//       });
//       const leaveUser = await users.findOne({ where: { userId: userId } });
//       const userImageURL = await images.findOne({ where: { userId: userId } });
//       const leavemsg = await Chat.findOne({
//         where: {
//           roomId: roomId,
//           chat: leaveUser.dataValues.nickname + '님이 퇴장하셨습니다.',
//         },
//       });

//       if (!leavemsg) {
//         await Chat.create({
//           userNickname: 'system',
//           userId: 'system',
//           roomId: roomId,
//           chat: leaveUser.dataValues.nickname + '님이 퇴장하셨습니다.',
//           userImg: null,
//         });
//       }

//       socket.to(leaveRoom.title).emit('bye', leaveUser.dataValues.nickname);

//       if (
//         leaveRoom.dataValues.hostId == userId &&
//         leaveRoom.dataValues.roomUserId.length === 0
//       ) {
//         //유저가 0명이면
//         await Room.destory({ whre: { roomId: roomId } });
//       } else if (leaveRoom.dataValues.hostId === userId) {
//         //host만 남아있으면 host정보만 남긴다

//         let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
//           (roomUsersId) => roomUsersId !== leaveRoom.dataValues.roomUserId[0]
//         );
//         let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
//           (roomUsersNickname) =>
//             roomUsersNickname !== leaveRoom.dataValues.roomUserNickname[0]
//         );
//         let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
//           (roomUsersImg) => roomUsersImg !== leaveRoom.dataValues.roomUserImg[0]
//         );
//         let roomUserNum = roomUsersId.length + 1;

//         await Room.update(
//           {
//             hostId: leaveRoom.dataValues.roomUserId[0],
//             hostNickname: leaveRoom.dataValues.roomUserNickname[0],
//             hostImg: leaveRoom.dataValues.roomUserImg[0],
//             roomUserId: roomUsersId,
//             roomUserNickname: roomUsersNickname,
//             roomUserImg: roomUsersImg,
//             roomUserNum: roomUserNum,
//           },
//           { where: { roomId: roomId } }
//         );
//       } else {
//         // user가 남았다면
//         let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
//           (roomUsersId) => roomUsersId !== Number(userId)
//         );
//         let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
//           (roomUsersNickname) =>
//             roomUsersNickname !== leaveUser.dataValues.nickname
//         );
//         let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
//           (roomUsersImg) => roomUsersImg !== userImageURL.userImageURL
//         );
//         let roomUserNum = roomUsersId.length + 1;
//         await Room.update(
//           {
//             roomUserId: roomUsersId,
//             roomUserNickname: roomUsersNickname,
//             roomUserImg: roomUsersImg,
//             roomUserNum: roomUserNum,
//           },
//           { where: { roomId: roomId } }
//         );
//       }
//     });
//   });
// };
