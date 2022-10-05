const ErrorCustom = require('../advice/errorCustom');
const schedule = require('node-schedule');
const dayjs = require('dayjs');

const SelectRepository = require('../repositories/select.repository');

class SelectService {
  selectRepository = new SelectRepository();

  createSelect = async (title, category, time, options, location, userKey) => {
    const cooltime = dayjs(new Date()).subtract(5, 'm').format();

    const fiveminute = await this.selectRepository.findOneCooltime(
      userKey,
      cooltime
    );

    if (fiveminute) {
      throw new ErrorCustom(400, '선택글은 5분에 1번만 작성 가능합니다.');
    }

    const deadLine = dayjs(new Date()).add(parseInt(time), 'h').format();

    const createSelect = await this.selectRepository.createSelect(
      title,
      category,
      location,
      deadLine,
      options,
      userKey
    );

    await this.selectRepository.incrementPoint(userKey);

    schedule.scheduleJob(deadLine, async () => {
      console.log(deadLine, '게시물 마감처리');

      await this.selectRepository.updateCompletion(createSelect);

      const completionVote = await this.selectRepository.completionVote(
        createSelect
      );

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
          const choiceUser = await this.selectRepository.choiceUser(
            createSelect,
            i
          );
          choiceUser.map((e) => {
            e.User.update({ point: e.User.point + 3 });
          });
        }
      }
    });

    return createSelect;
  };

  allSelet = async (offset, limit) => {
    const allSelet = await this.selectRepository.findAllSelect(offset, limit);

    return allSelet;
  };

  filterSelect = async (offset, limit) => {
    const filterSelects = await this.selectRepository.findAllFilter(
      offset,
      limit
    );

    return filterSelects;
  };

  categorySelect = async (category, offset, limit) => {
    const categorySelects = await this.selectRepository.findAllCategory(
      category,
      offset,
      limit
    );

    if (!categorySelects) {
      throw new ErrorCustom(400, '해당 카테고리에 글이 존재하지 않습니다.');
    }

    return categorySelects;
  };

  ongoingSelect = async (offset, limit) => {
    const ongoingSelects = await this.selectRepository.findAllOngoing(
      offset,
      limit
    );

    return ongoingSelects;
  };

  searchSelect = async (searchWord) => {
    const searchSelects = await this.selectRepository.findAllSearchWord(
      searchWord
    );

    if (searchSelects.length == 0) {
      throw new ErrorCustom(400, '키워드와 일치하는 검색결과가 없습니다.');
    }

    return searchSelects;
  };

  detailSelect = async (selectKey) => {
    const detailSelect = await this.selectRepository.findOneSelect(selectKey);

    if (!detailSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    return detailSelect;
  };

  deleteSelect = async (selectKey, userKey) => {
    const delSelect = await this.selectRepository.findOneSelect(selectKey);

    if (!delSelect) {
      throw new ErrorCustom(400, '해당 선택글이 존재하지 않습니다.');
    }

    if (userKey !== delSelect.userKey) {
      throw new ErrorCustom(400, '작성자가 일치하지 않습니다.');
    }

    await this.selectRepository.delSelect(selectKey);

    return delSelect;
  };
}

module.exports = SelectService;
