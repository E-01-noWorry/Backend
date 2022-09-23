const schedule = require('node-schedule');
const { Select } = require('../models');
const dayjs = require('dayjs');

exports.scheduler = () => {
  const now = dayjs(new Date()).add(9, 'h').format();
  now = dayjs(now).subtract(16, 'm').format();
  now = dayjs(now).subtract(59, 's').format();
  console.log(now);

  schedule.scheduleJob('00 25 * * * *', async function () {
    console.log(now);
    console.log('데이터 확인');
    const datas = await Select.findAll({});
    await Promise.all(
      datas.map((e) => {
        if (dayjs(e.deadLine).format() < now) {
          e.update({ compeltion: true });
        }
      })
    );
  });
};
