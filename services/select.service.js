const ErrorCustom = require('../advice/errorCustom');
const schedule = require('node-schedule');
const dayjs = require('dayjs');

const SelectRepository = require('../repositories/select.repository');

class SelectService {
  selectRepository = new SelectRepository();

  createSelect = async (title, category, time, options, location, userKey) => {
    // 선택글 생성 5분 쿨타임 구현
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

    // 선택글 생성시 +3점씩 포인트 지급
    await this.selectRepository.incrementPoint(userKey);

    // 스케줄러로 마감시간이 되면 completion true로 바꾸고, 최다선택지 투표한 사람 포인트 적립
    schedule.scheduleJob(deadLine, async () => {
      console.log('게시물 마감처리');
      await this.selectRepository.updateCompletion(createSelect);
      // await createSelect.update({ completion: true });

      const completionVote = await this.selectRepository.completionVote(
        createSelect
      );
      // await Vote.findAll({
      //   where: { selectKey: createSelect.selectKey },
      //   include: [{ model: User }],
      // });

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
