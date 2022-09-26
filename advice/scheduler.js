const schedule = require('node-schedule');
const { Select } = require('../models');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

exports.scheduler = () => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault('Asia/Seoul');

  let now;
  if (process.env.NODE_ENV == 'production' && process.env.PORT2) {
    // now = dayjs(new Date()).add(9, 'h').add(2, 'm').subtract(9, 's').format();
    now = dayjs().tz().format();
    // console.log(now)
  } else {
    // now = dayjs(new Date()).format();
    now = dayjs().tz().format();
  }
  console.log(now);

  schedule.scheduleJob('*/20 * * * *', async function () {
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
