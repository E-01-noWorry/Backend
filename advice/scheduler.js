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

  schedule.scheduleJob('*/10 * * * *', async function () {
    now = dayjs().tz().format();
    console.log(now, '반복 스케줄러 동작');

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
