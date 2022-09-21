const schedule = require('node-schedule');
const { Select } = require('../models');
const dayjs = require('dayjs');

exports.scheduler = () => {
  const checkTime = dayjs().format();

  schedule.scheduleJob('00 00 * * * *', async function () {
    console.log('데이터 확인');
    const datas = await Select.findAll({});
    await Promise.all(
      datas.map((e) => {
        if (dayjs(e.deadLine).format() < checkTime) {
          e.update({ compeltion: true });
        }
      })
    );
  });
};
