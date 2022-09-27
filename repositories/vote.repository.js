const { Select, User, Vote } = require('../models');

class VoteRepository {
  findOneSelect = async (selectKey) => {
    const findOneSelect = await Select.findOne({
      where: { selectKey },
      include: [{ model: User, attributes: ['deviceToken'] }],
    });

    return findOneSelect;
  };

  findOneVote = async (selectKey, userKey) => {
    const findOneVote = await Vote.findOne({
      where: { selectKey, userKey },
      attributes: ['choice'],
    });

    return findOneVote;
  };

  findAllVote = async (selectKey) => {
    const findAllVote = await Vote.findAll({ where: { selectKey } });

    return findAllVote;
  };

  createVote = async (selectKey, userKey, choice) => {
    const createVote = await Vote.create({ selectKey, userKey, choice });

    return createVote;
  };

  incrementPoint = async (userKey) => {
    const incrementPoint = await User.increment(
      { point: 1 },
      { where: { userKey } }
    );

    return incrementPoint;
  };
}

module.exports = VoteRepository;
