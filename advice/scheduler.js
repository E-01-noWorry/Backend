const schedule = require('node-schedule');
const { Select } = require('../models');
const dayjs = require('dayjs');

exports.scheduler = () => {
  let now;
  if (process.env.NODE_ENV == 'production' && process.env.PORT2) {
    now = dayjs(new Date()).add(9, 'h').add(2, 'm').subtract(9, 's').format();
  } else {
    now = dayjs(new Date()).format();
  }
  console.log(now);

  schedule.scheduleJob('00 00 * * * *', async function () {
    console.log(now);
    console.log('데이터 확인');
    const datas = await Select.findAll({});
    await Promise.all(
      datas.map((e) => {
        if (dayjs(e.deadLine).format() < now) {
          e.update({ completion: true });
        }
      })
    );
  });
};
