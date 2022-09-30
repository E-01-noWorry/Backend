const app = require('./app');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config();

const { Room, Chat, User, Participant } = require('./models');
const { Op } = require('sequelize');
const admin = require('firebase-admin');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

let server = '';
if (process.env.NODE_ENV == 'production' && process.env.PORT2) {
  try {
    const ca = fs.readFileSync(
      '/etc/letsencrypt/live/jolee.shop/fullchain.pem',
      'utf8'
    );
    const privateKey = fs.readFileSync(
      '/etc/letsencrypt/live/jolee.shop/privkey.pem',
      'utf8'
    );
    const certificate = fs.readFileSync(
      '/etc/letsencrypt/live/jolee.shop/cert.pem',
      'utf8'
    );

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };
    server = https.createServer(credentials, app);
  } catch (err) {
    console.log('HTTPS 서버가 실행되지 않습니다.');
    console.log(err);
  }
} else {
  server = http.createServer(app);
}

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://www.gomgom.site'],
    credentials: true,
  },
});

// 소캣 연결
io.on('connection', (socket) => {
  console.log('a user connected');

  // 채팅방 목록? 접속(입장전)
  socket.on('join-room', async (data) => {
    let { roomKey, userKey } = data;
    let enterUser = await Participant.findOne({
      where: { roomKey, userKey },
      include: [
        { model: User, attributes: ['nickname'] },
        { model: Room, attributes: ['title'] },
      ],
    });

    if (!enterUser) {
      const today = dayjs().tz().format('YYYY-MM-DD 00:00:00');
      const chatTime = new Date(today).setHours(new Date(today).getHours() - 9);

      const todayChat = await Chat.findOne({
        where: {
          roomKey,
          createdAt: { [Op.gt]: chatTime },
        },
      });

      if (!todayChat) {
        await Chat.create({
          roomKey,
          userKey: 12, // 관리자 유저키
          chat: `${dayjs(today).format('YYYY년 MM월 DD일')}`,
        });
      }

      await Participant.create({ userKey, roomKey });

      enterUser = await Participant.findOne({
        where: { roomKey, userKey },
        include: [
          { model: User, attributes: ['nickname'] },
          { model: Room, attributes: ['title'] },
        ],
      });

      await Chat.create({
        roomKey,
        userKey: 12, // 관리자 유저키
        chat: `${enterUser.User.nickname}님이 입장했습니다.`,
      });

      socket.join(enterUser.Room.title);

      let param = { nickname: enterUser.User.nickname };
      io.to(enterUser.Room.title).emit('welcome', param);
    } else {
      // 해당 채팅방 입장
      socket.join(enterUser.Room.title);
    }
  });

  // 채팅 받아서 저장하고, 그 채팅 보내서 보여주기
  socket.on('chat_message', async (data) => {
    let { message, roomKey, userKey } = data;

    const today = dayjs().tz().format('YYYY-MM-DD 00:00:00');
    const chatTime = new Date(today).setHours(new Date(today).getHours() - 9);

    const todayChat = await Chat.findOne({
      where: {
        roomKey,
        createdAt: { [Op.gt]: chatTime },
      },
    });

    if (!todayChat) {
      await Chat.create({
        roomKey,
        userKey: 12, // 관리자 유저키
        chat: `${dayjs(today).format('YYYY년 MM월 DD일')}`,
      });
    }

    const newChat = await Chat.create({
      roomKey,
      userKey,
      chat: message,
    });
    const chatUser = await Participant.findOne({
      where: { roomKey, userKey },
      include: [
        { model: User, attributes: ['nickname', 'point'] },
        {
          model: Room,
          attributes: ['title'],
          include: [{ model: User, attributes: ['deviceToken'] }],
        },
      ],
    });

    if (chatUser.Room.User.deviceToken) {
      let target_token = chatUser.Room.User.deviceToken;

      const message = {
        token: target_token,
        data: {
          title: '곰곰',
          body: '새로운 채팅이 왔습니다!',
          link: `chatroom/${roomKey}`,
        },
      };

      admin
        .messaging()
        .send(message)
        .catch(function (err) {
          next(err);
        });
    }

    // 채팅 보내주기
    let param = {
      message,
      roomKey,
      userKey: chatUser.userKey,
      nickname: chatUser.User.nickname,
      point: chatUser.User.point,
      time: dayjs(new Date()).format(),
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

      let param = { nickname: leaveUser.User.nickname };
      io.to(leaveUser.Room.title).emit('bye', param);
    }
  });

  // 채팅방의 사람들 정보 주기
  socket.on('showUsers', async (data) => {
    let { roomKey, userKey } = data;
    const room = await Room.findOne({ where: roomKey });
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
    io.to(room.title).emit('receive', param);
  });

  // 추천하기
  socket.on('recommend', async (data) => {
    // 여기서 유저키는 추천 받은 사람의 유저키
    let { roomKey, userKey } = data;
    const room = await Room.findOne({ where: roomKey });
    const recommendUser = await User.increment(
      { point: 5 },
      { where: { userKey } }
    );

    let param = { userKey: recommendUser.userKey };
    io.to(room.title).emit('recommend', param);
  });

  // 강퇴하기
  socket.on('expulsion', async (data) => {
    console.log(data, "받은값")
    // 여기서 유저키는 내보낼 사람의 유저키
    let { roomKey, userKey } = data;
    const room = await Room.findOne({ where: roomKey });

    const expulsionUser = await Participant.destroy({ roomKey, userKey });
    console.log(expulsionUser, "내보낼 사람")

    const nickname = await User.findOne({ where: { userKey } });

    await Chat.create({
      roomKey,
      userKey: 12, // 관리자 유저키
      chat: `${nickname}님이 강퇴되었습니다.`,
    });
    console.log("퇴장메세지 저장")

    let param = { userKey: expulsionUser.userKey, nickname };
    io.to(room.title).emit('expulsion', param);
  });
});

module.exports = { server };
