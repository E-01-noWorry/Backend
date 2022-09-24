const { Select, User, Vote, Sequelize } = require('../models');
const { Op } = require('sequelize');
const ErrorCustom = require('../advice/errorCustom');
const schedule = require('node-schedule');
const dayjs = require('dayjs');
const joi = require('../advice/joiSchema');

class SelectController {
  postSelect = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const validation = joi.selectSchema.validate(req.body);
      if (validation.error) {
        throw new ErrorCustom(400, '항목들을 모두 입력해주세요.');
      }
      const { title, category, time, options } = validation.value;

      if (options.indexOf(',') === -1) {
        throw new ErrorCustom(400, '선택지는 최소 2개 이상 작성해주세요.');
      }

      const image = req.files;
      let location = [];
      if (image !== undefined) {
        location = image.map((e) => e.location);
      }

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

      const data = await Select.create({
        title,
        category,
        image: location,
        deadLine,
        options: options.toString().split(','),
        userKey,
        compeltion: false,
      });

      // 스케줄러로 마감시간이 되면 compeltion true로 바꾸고, 최다선택지 투표한 사람 포인트 적립
      schedule.scheduleJob(deadLine, async () => {
        console.log('게시물 마감처리');
        await data.update({ compeltion: true });

        const compeltionVote = await Vote.findAll({
          where: { selectKey: data.selectKey },
          include: [{ model: User }],
        });

        const count = [0, 0, 0, 0];
        compeltionVote.map((e) => {
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
              where: { selectKey: data.selectKey, choice: i + 1 },
              include: [{ model: User }],
            });
            choiceUser.map((e) => {
              e.User.update({ point: e.User.point + 3 });
            });
          }
        }
      });

      //선택글 생성시 +3점씩 포인트 지급
      let selectPoint = await User.findOne({ where: { userKey } });
      await selectPoint.update({ point: selectPoint.point + 3 });

      return res.status(200).json({
        ok: true,
        msg: '선택글 작성 성공',
        result: {
          selectKey: data.selectKey,
          title: data.title,
          category: data.category,
          deadLine: deadLine,
          completion: false,
          nickname: nickname,
          selectPoint: selectPoint.point,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getAllSelect = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const datas = await Select.findAll({
        include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
        order: [['selectKey', 'DESC']],
        offset: offset,
        limit: limit,
      });

      return res.status(200).json({
        ok: true,
        msg: '선택글 모두 조회 성공',
        result: datas.map((e) => {
          return {
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.compeltion,
            nickname: e.User.nickname,
            options: e.options,
            total: e.Votes.length,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getFilter = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const datas = await Select.findAll({
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

      const popular = datas.map((e) => ({
        total: e.dataValues.total,
        selectKey: e.selectKey,
        title: e.title,
        category: e.category,
        deadLine: e.deadLine,
        completion: e.compeltion,
        nickname: e.User.nickname,
        options: e.options,
      }));

      res.status(201).json({
        msg: '인기글이 조회되었습니다.',
        data: popular,
      });
    } catch (err) {
      next(err);
    }
  };

  getCategory = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const { category } = joi.categorySchema.validate(req.params).value;

      const data = await Select.findAll({
        where: { [Op.or]: [{ category: { [Op.like]: `%${category}%` } }] },
        include: [{ model: User, attributes: ['nickname'] }, { model: Vote }],
        order: [['selectKey', 'DESC']],
        offset: offset,
        limit: limit,
      });

      if (!data) {
        throw new ErrorCustom(400, '해당 카테고리에 글이 존재하지 않습니다.');
      }

      res.status(200).json({
        msg: '카테고리 조회 성공',
        result: data.map((c) => {
          return {
            selectKey: c.selectKey,
            title: c.title,
            category: c.category,
            deadLine: c.deadLine,
            completion: c.compeltion,
            nickname: c.User.nickname,
            options: c.options,
            total: c.Votes.length,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getDetailSelect = async (req, res, next) => {
    try {
      const { selectKey } = joi.selectKeySchema.validate(req.params).value;

      const data = await Select.findOne({
        where: { selectKey },
        include: [{ model: User, attributes: ['nickname', 'point'] }],
      });

      if (!data) {
        throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
      }

      return res.status(200).json({
        ok: true,
        msg: '선택글 상세 조회 성공',
        result: {
          selectKey: data.selectKey,
          title: data.title,
          category: data.category,
          image: data.image,
          deadLine: data.deadLine,
          options: data.options,
          completion: data.compeltion,
          userKey: data.userKey,
          nickname: data.User.nickname,
          point: data.User.point,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  deleteSelect = async (req, res, next) => {
    try {
      const { userKey, nickname } = res.locals.user;
      const { selectKey } = joi.selectKeySchema.validate(req.params).value;
      const data = await Select.findOne({ where: { selectKey } });

      if (!data) {
        throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
      }

      if (userKey !== data.userKey) {
        throw new ErrorCustom(400, '작성자가 일치하지 않습니다.');
      }

      await Select.destroy({ where: { selectKey } });

      return res.status(200).json({
        ok: true,
        msg: '선택글 삭제 성공',
        result: {
          selectKey: data.selectKey,
          title: data.title,
          category: data.category,
          deadLine: data.deadLine,
          completion: data.completion,
          nickname: nickname,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = SelectController;
