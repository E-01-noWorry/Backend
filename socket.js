const app = require('./app');
require('fs');
const {
  images,
  Chats,
  Rooms,
  users,
  sequelize,
  Sequelize,
} = require('./models');
// require('socket.io-client')('https://');
require('http').createServer(app);

module.exports = (server, app) => {
  // const io = require("socket.io")(server, {
  //     cors: {
  //         origin: ["http://", "*", "https://"],
  //         credentials: true,
  //     },
  // });
  app.set('io', io);
  io.on('connection', (socket) => {
    //서버에 연결되면 아래 코드 실행
    //채팅방 접속시
    socket.on('join-room', async (roomId, userId) => {
      const enterRoom = await Rooms.findOne({
        where: { rommId: roomId },
      });
      const enterUser = await users.findOne({
        where: { userId: userId },
      });
      const entermsg = await Chats.findOne({
        where: {
          roomId: roomId,
          chat: enterUser.dataValues.nickname + '님이 입장하셨습니다.',
        },
      });
      socket.join(enterRoom.title);
      if (!entermsg) {
        await Chats.create({
          userNickname: 'system',
          userId: 'system',
          roomId: roomId,
          chat: enterUser.dataValues.nickname + '님이 입장하셨습니다.',
          userImg: null,
        });
      }

      // 기존에없는 새로운 유저가 접속하면 정보를 저장하고 room정보 업데이트
      if (
        enterRoom.dataValues.hostId != Number(userId) &&
        !enterRoom.datavalues.roomUserId.includes(Number(userId))
      ) {
        let UserImageURL = await images.findOne({
          attributes: ['userImageURL'],
          where: { userId: userId },
        });
        enterRoom.roomUserId.push(Number(userId));
        enterRoom.roomUserNickname.push(enterUser.dataValues.nickname);
        let roomUserNum = enterRoom.roomUserNickname.length + 1;
        enterRoom.roomUserImg.push(userImageURL.userImageURL);

        await Rooms.update(
          {
            roomUserId: enterRoom.dataValues.roomUserId,
            roomUserImg: enterRoom.dataValues.roomUserImg,
            roomUserNickname: enterRoom.dataValues.roomUserNickname,
            roomUserNum: roomUserNum,
          },
          { where: { roomId: roomId } }
        );
      }
      socket.to(enterRoom.title).emit('welcome', enterUser.dataValues.nickname);
    });

    //채팅 정보
    socket.on('chat_message', async (messageChat, userId, roomId) => {
      const chatUser = await users.findOne({ where: { userId: userId } });
      const userImg = await images.findOne({ where: { userId: userId } });
      const room = await Rooms.findOne({ where: { roomId: roomId } });
      await Chats.create({
        userNickname: chatUser.dataValues.nickname,
        useId: userId,
        roomId: roomId,
        chat: messageChat,
        userImg: userImg.dataValues.userImageURL,
      });

      socket
        .to(room.title)
        .emit(
          'message',
          messageChat,
          chatUser.dataValues.nickname,
          userImg.dataValues.userImageURL,
          roomId
        );
    });

    //채팅방 나가기
    socket.on('leave-room', async (roomId, userId) => {
      const leaveRoom = await Rooms.findOne({
        where: { roomId: roomId },
      });
      const leaveUser = await users.findOne({ where: { userId: userId } });
      const userImageURL = await images.findOne({ where: { userId: userId } });
      const leavemsg = await Chats.findOne({
        where: {
          roomId: roomId,
          chat: leaveUser.dataValues.nickname + '님이 퇴장하셨습니다.',
        },
      });

      if (!leavemsg) {
        await Chats.create({
          userNickname: 'system',
          userId: 'system',
          roomId: roomId,
          chat: leaveUser.dataValues.nickname + '님이 퇴장하셨습니다.',
          userImg: null,
        });
      }

      socket.to(leaveRoom.title).emit('bye', leaveUser.dataValues.nickname);

      if (
        leaveRoom.dataValues.hostId == userId &&
        leaveRoom.dataValues.roomUserId.length === 0
      ) {
        //유저가 0명이면
        await Rooms.destory({ whre: { roomId: roomId } });
      } else if (leaveRoom.dataValues.hostId === userId) {
        //host만 남아있으면 host정보만 남긴다

        let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
          (roomUsersId) => roomUsersId !== leaveRoom.dataValues.roomUserId[0]
        );
        let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
          (roomUsersNickname) =>
            roomUsersNickname !== leaveRoom.dataValues.roomUserNickname[0]
        );
        let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
          (roomUsersImg) => roomUsersImg !== leaveRoom.dataValues.roomUserImg[0]
        );
        let roomUserNum = roomUsersId.length + 1;

        await Rooms.uupdate(
          {
            hostId: leaveRoom.dataValues.roomUserId[0],
            hostNickname: leaveRoom.dataValues.roomUserNickname[0],
            hostImg: leaveRoom.dataValues.roomUserImg[0],
            roomUserId: roomUsersId,
            roomUserNickname: roomUsersNickname,
            roomUserImg: roomUsersImg,
            roomUserNum: roomUserNum,
          },
          { where: { roomId: roomId } }
        );
      } else {
        // user가 남았다면
        let roomUsersId = leaveRoom.dataValues.roomUserId.filter(
          (roomUsersId) => roomUsersId !== Number(userId)
        );
        let roomUsersNickname = leaveRoom.dataValues.roomUserNickname.filter(
          (roomUsersNickname) =>
            roomUsersNickname !== leaveUser.dataValues.nickname
        );
        let roomUsersImg = leaveRoom.dataValues.roomUserImg.filter(
          (roomUsersImg) => roomUsersImg !== userImageURL.userImageURL
        );
        let roomUserNum = roomUsersId.length + 1;
        await Rooms.update(
          {
            roomUserId: roomUsersId,
            roomUserNickname: roomUsersNickname,
            roomUserImg: roomUsersImg,
            roomUserNum: roomUserNum,
          },
          { where: { roomId: roomId } }
        );
      }
    });
  });
};
