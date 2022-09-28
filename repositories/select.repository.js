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
    const incrementPoint = await User.increment(
      { point: 3 },
      { where: { userKey } }
    );

    return incrementPoint;
  };

  //
  updateCompletion = async (createSelect) => {
    const updateCompletion = await createSelect.update({ completion: true });

    return updateCompletion;
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

  findAllfilter = async (offset, limit) => {
    const findAllfilter = await Select.findAll({
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

    return findAllfilter;
  };

  findAllcategory = async (category, offset, limit) => {
    const findAllcategory = await Select.findAll({
      where: {
        [Op.or]: [{ category: { [Op.like]: `%${category}%` } }],
      },
      include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
      order: [['selectKey', 'DESC']],
      offset: offset,
      limit: limit,
    });

    return findAllcategory;
  };

  delSelect = async (selectKey) => {
    const delSelect = await Select.destroy({ where: { selectKey } });

    return delSelect;
  };
}

module.exports = SelectRepository;
