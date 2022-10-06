const { Select, User, Vote, Sequelize } = require('../models');
const { Op } = require('sequelize');

class SelectRepository {
  findOneCooltime = async (userKey, cooltime) => {
    const fiveMinSelect = await Select.findOne({
      where: {
        userKey,
        createdAt: { [Op.gt]: cooltime },
      },
      attributes: ['createdAt'],
    });

    return fiveMinSelect;
  };

  createSelect = async (
    title,
    category,
    location,
    deadLine,
    options,
    userKey
  ) => {
    const createSelect = await Select.create({
      title,
      category,
      image: location,
      deadLine,
      options: options.toString().split(','),
      userKey,
      completion: false,
    });

    return createSelect;
  };

  incrementPoint = async (userKey) => {
    await User.increment({ point: 3 }, { where: { userKey } });
  };

  //
  updateCompletion = async (createSelect) => {
    await createSelect.update({ completion: true });
  };

  completionVote = async (createSelect) => {
    const completionVote = await Vote.findAll({
      where: { selectKey: createSelect.selectKey },
      include: [{ model: User }],
    });

    return completionVote;
  };

  choiceUser = async (createSelect, i) => {
    const choiceUser = await Vote.findAll({
      where: { selectKey: createSelect.selectKey, choice: i + 1 },
      include: [{ model: User }],
    });

    return choiceUser;
  };
  //

  findOneSelect = async (selectKey) => {
    const findOneSelect = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['nickname', 'point'] }],
    });

    return findOneSelect;
  };

  findAllSelect = async (offset, limit) => {
    const findAllSelect = await Select.findAll({
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return findAllSelect;
  };

  findAllFilter = async (offset, limit) => {
    const findAllFilter = await Select.findAll({
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

    return findAllFilter;
  };

  findAllCategory = async (category, offset, limit) => {
    const findAllCategory = await Select.findAll({
      where: {
        [Op.or]: [{ category: { [Op.like]: `%${category}%` } }],
      },
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return findAllCategory;
  };

  findAllOngoing = async (offset, limit) => {
    const findAllOngoing = await Select.findAll({
      where: { completion: false },
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return findAllOngoing;
  };

  findAllSearchWord = async (searchWord) => {
    const searchResult = await Select.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${searchWord}%` } },
          { options: { [Op.substring]: `%${searchWord}%` } },
        ],
      },
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
    });

    return searchResult;
  };

  delSelect = async (selectKey) => {
    await Select.destroy({ where: { selectKey } });
  };
}

module.exports = SelectRepository;
