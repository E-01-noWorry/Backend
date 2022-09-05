const app = require('./app');
const socket = require('socket.io');
const http = require('http');
const { Room, Chat, User, Participant } = require('./models');
const { param } = require('./routes');
// require('socket.io-client')('http://localhost:3000');
const server = http.createServer(app);

// ------------------채팅 소캣 부분만 한번 만져봄(여기서부터) ----------------

module.exports = (server, app) => {
  const io = socket(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  app.set('socket.io', io);

  // 프, 백 모두 데이터를 넘겨주고 받을때 객체로 줄테니까 받을땐 data / 보내줄땐 param 이라는 변수에 담아서 받자마자 구조화할당으로 나눠서 변수를 쓰면 좋지 않을까?
  // ex)data = {roomKey, userKey, msg} / param = {roomKey:3, userKey:2, msg:"안녕"}
  // api명세를 보니까 leave-room -> leaveRoom 처럼 카멜케이스 하면 좋을것같음
  // 채팅 주고 받기도  chat_message와 message가 있는데 하나통일하면 좋을것같음

  // 소캣 연결
  io.on('connection', (socket) => {
    console.log('a user connected');
    // 채팅방 목록? 접속(입장전)
    socket.on('join-room', async (data) => {
      let { roomKey, userKey } = data;
      console.log('join-room');
      const enterUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title'] },
        ],
      });
      console.log(enterUser);
      // 해당 채팅방 입장
      // socket.join(enterUser.Room.title);
      console.log('방들어옴');

      // 지금은 api에서 참가자 디비를 만들어서 입장했다는 chat을 찾아보고 처음인지 재방문인지 확인하는데
      // api에서 참가자 디비를 만들지 않고, 소캣통신에 들어오면 참가자를 만든다면, 참가자 정보를 찾아서 처음인지 재방문인지 알수가 있음
      // 하지만 위와 같이 하면 결국 채팅방title, 유저nickname을 알기위해 추가적으로 디비에 접근을 해야하는 문제가 생김(그냥 지금처럼 입장chat을 검색해서 처음인지 확인하는게 나을까요?)
      const enterMsg = await Chat.findOne({
        where: {
          roomKey,
          userKey: 12,
          chat: `${enterUser.User.nickname}님이 입장했습니다.`,
        },
      });
      console.log(enterMsg);
      // 처음입장이라면
      if (!enterMsg) {
        console.log('처음입장');
        await Chat.create({
          roomKey,
          userKey: 12, // 관리자 유저키
          chat: `${enterUser.User.nickname}님이 입장했습니다.`,
        });
        console.log('메세지 만듬?');
        // 관리자 환영메세지 보내기
        let param = { nickname: enterUser.User.nickname };
        io.emit('welcome', param);
        // 닉네임보다 message: `${enterUser.User.nickname}님이 입장했습니다.`를 보내주면 낫지 않을까? 그럼 프론트에서 바로 message를 띄우면 될것같은데
      } else {
        // 재입장이라면 아무것도 없음
        // let param = { nickname: enterUser.User.nickname };
        // console.log('재입장임');
        // socket.emit('welcome', param);
      }
    });

    // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
    socket.on('chat_message', async (data) => {
      let { message, roomKey, userKey } = data;
      console.log(message, roomKey, userKey);
      await Chat.create({
        roomKey,
        userKey,
        chat: message,
      });
      const chatUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title'] },
        ],
      });
      // 채팅 보내주기
      let param = { message, roomKey, nickname: chatUser.User.nickname };
      console.log(param);
      console.log(chatUser.Room.title);

      io.emit('message', param);
      console.log('메세지 보냄');
    });

    // 채팅방 나가기(채팅방에서 아에 퇴장)
    socket.on('leave-room', async (data) => {
      let { roomKey, userKey } = data;
      const leaveUser = await await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title', 'userKey'] },
        ],
      });

      // 호스트가 나갔을 때
      if (userKey === leaveUser.Room.userKey) {
        let param = { nickname: leaveUser.User.nickname };
        io.to(leaveUser.Room.title).emit('byeHost', param);
        // 호스트가 나간거니까 api로 채팅방의 참가자, 채팅, 채팅방 자체를 삭제해버림
        // byeHost로 통신이 되면 거기 안에 있는 사람들에게 알림을 띄우고 채팅방 목록으로 강제이동해주면 방폭파 느낌이 나지 않을까?
      } else {
        // 일반유저가 나갔을 때(호스트X)
        await Chat.create({
          roomKey,
          userKey: 12, // 관리자 유저키
          chat: `${leaveUser.User.nickname}님이 퇴장했습니다.`,
        });
        let param = { nickname: leaveUser.User.nickname };
        io.to(leaveUser.Room.title).emit('bye', param);
        // 닉네임보다 message: `${leaveUser.User.nickname}님이 퇴장했습니다.`를 보내주면 낫지 않을까?
      }
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
