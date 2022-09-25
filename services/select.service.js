const { Select, User, Vote, Sequelize } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');
const schedule = require('node-schedule');
const dayjs = require('dayjs');

class SelectService {
  createSelect = async (title, category, time, options, location, userKey) => {
    // 선택글 생성 5분 쿨타임 구현
    const cooltime = dayjs(new Date()).subtract(5, 'm').format();

    const fiveminute = await Select.findOne({
      where: {
        userKey,
        createdAt: { [Op.gt]: cooltime },
      },
      attributes: ['createdAt'],
    });

    if (fiveminute) {
      throw new ErrorCustom(400, '선택글은 5분에 1번만 작성 가능합니다.');
    }

    const deadLine = dayjs(new Date()).add(parseInt(time), 'h').format();

    const createSelect = await Select.create({
      title,
      category,
      image: location,
      deadLine,
      options: options.toString().split(','),
      userKey,
      completion: false,
    });

    //선택글 생성시 +3점씩 포인트 지급
    await User.increment({ point: 3 }, { where: { userKey } });

    // 스케줄러로 마감시간이 되면 completion true로 바꾸고, 최다선택지 투표한 사람 포인트 적립
    schedule.scheduleJob(deadLine, async () => {
      console.log('게시물 마감처리');
      await createSelect.update({ completion: true });

      const completionVote = await Vote.findAll({
        where: { selectKey: createSelect.selectKey },
        include: [{ model: User }],
      });

      const count = [0, 0, 0, 0];
      completionVote.map((e) => {
        if (e.choice === 1) {
          ++count[0];
        } else if (e.choice === 2) {
          ++count[1];
        } else if (e.choice === 3) {
          ++count[2];
        } else if (e.choice === 4) {
          ++count[3];
        }
      });
      const maxVote = Math.max(count[0], count[1], count[2], count[3]);
      for (let i = 0; i < 4; i++) {
        if (count[i] === maxVote) {
          const choiceUser = await Vote.findAll({
            where: { selectKey: createSelect.selectKey, choice: i + 1 },
            include: [{ model: User }],
          });
          choiceUser.map((e) => {
            e.User.update({ point: e.User.point + 3 });
          });
        }
      }
    });

    return createSelect;
  };

  allSelet = async (offset, limit) => {
    const allSelet = await Select.findAll({
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return allSelet;
  };

  filterSelect = async (offset, limit) => {
    const filterSelects = await Select.findAll({
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('Votes.selectKey')), 'total'],
        ],
      },
      include: [
        { model: User, attributes: ['nickname'] },
        {
          attributes: [],
          model: Vote,
          duplicating: false,
          required: false,
        },
      ],
      group: ['Select.selectKey'],
      order: [['total', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return filterSelects;
  };

  categorySelect = async (category, offset, limit) => {
    const categorySelects = await Select.findAll({
      where: { [Op.or]: [{ category: { [Op.like]: `%${category}%` } }] },
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    if (!categorySelects) {
      throw new ErrorCustom(400, '해당 카테고리에 글이 존재하지 않습니다.');
    }

    return categorySelects;
  };

  detailSelect = async (selectKey) => {
    const detailSelect = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    if (!detailSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    return detailSelect;
  };

  deleteSelect = async (selectKey, userKey) => {
    const delSelect = await Select.findOne({ where: { selectKey } });

    if (!delSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    if (userKey !== delSelect.userKey) {
      throw new ErrorCustom(400, '작성자가 일치하지 않습니다.');
    }

    await Select.destroy({ where: { selectKey } });

    return delSelect;
  };
}

module.exports = SelectService;
