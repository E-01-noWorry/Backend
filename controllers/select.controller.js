const ErrorCustom = require('../advice/errorCustom');
const joi = require('../advice/joiSchema');

const SelectService = require('../services/select.service'); //

class SelectController {
  selectService = new SelectService(); //

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

      const createSelect = await this.selectService.createSelect(
        title,
        category,
        time,
        options,
        location,
        userKey
      );

      return res.status(200).json({
        ok: true,
        msg: '선택글 작성 성공',
        result: {
          selectKey: createSelect.selectKey,
          title: createSelect.title,
          category: createSelect.category,
          deadLine: createSelect.deadLine,
          completion: false,
          nickname: nickname,
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

      const allSelets = await this.selectService.allSelet(offset, limit);

      return res.status(200).json({
        ok: true,
        msg: '선택글 모두 조회 성공',
        result: allSelets.map((e) => {
          return {
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.completion,
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

      const filters = await this.selectService.filterSelect(offset, limit);

      res.status(200).json({
        msg: '인기글이 조회되었습니다.',
        data: filters.map((e) => {
          return {
            total: e.dataValues.total,
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.completion,
            nickname: e.User.nickname,
            options: e.options,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  getCategory = async (req, res, next) => {
    try {
      const { category } = joi.categorySchema.validate(req.params).value;
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const categorys = await this.selectService.categorySelect(
        category,
        offset,
        limit
      );

      res.status(200).json({
        msg: '카테고리 조회 성공',
        result: categorys.map((c) => {
          return {
            selectKey: c.selectKey,
            title: c.title,
            category: c.category,
            deadLine: c.deadLine,
            completion: c.completion,
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

  getOngoing = async (req, res, next) => {
    try {
      let offset = 0;
      const limit = 5;
      const pageNum = joi.pageSchema.validate(req.query.page).value;

      if (pageNum > 1) {
        offset = limit * (pageNum - 1);
      }

      const ongoings = await this.selectService.ongoingSelect(offset, limit);

      res.status(200).json({
        ok: true,
        msg: '진행중 선택글 조회 성공',
        result: ongoings.map((e) => {
          return {
            total: e.Votes.length,
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.completion,
            nickname: e.User.nickname,
            options: e.options,
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  };

  searchSelect = async (req, res, next) => {
    try {
      const { searchWord } = joi.searchSchema.validate(req.query).value;

      if (!searchWord) {
        throw new ErrorCustom(400, '검색어를 입력해주세요.');
      }

      const searchResults = await this.selectService.searchSelect(searchWord);

      res.status(200).json({
        ok: true,
        msg: '선택글 검색 조회 성공',
        result: searchResults.map((e) => {
          return {
            total: e.Votes.length,
            selectKey: e.selectKey,
            title: e.title,
            category: e.category,
            deadLine: e.deadLine,
            completion: e.completion,
            nickname: e.User.nickname,
            options: e.options,
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

      const detail = await this.selectService.detailSelect(selectKey);

      return res.status(200).json({
        ok: true,
        msg: '선택글 상세 조회 성공',
        result: {
          selectKey: detail.selectKey,
          title: detail.title,
          category: detail.category,
          image: detail.image,
          deadLine: detail.deadLine,
          options: detail.options,
          completion: detail.completion,
          userKey: detail.userKey,
          nickname: detail.User.nickname,
          point: detail.User.point,
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

      const delSelect = await this.selectService.deleteSelect(
        selectKey,
        userKey
      );

      return res.status(200).json({
        ok: true,
        msg: '선택글 삭제 성공',
        result: {
          selectKey: delSelect.selectKey,
          title: delSelect.title,
          category: delSelect.category,
          deadLine: delSelect.deadLine,
          completion: delSelect.completion,
          nickname: nickname,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = SelectController;
