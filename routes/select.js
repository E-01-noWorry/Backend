const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddlware');
const upload = require('../middlewares/multer');

const SelectController = require('../controllers/select.controller');
const selectController = new SelectController();

// 선택글 작성
router.post(
  '/',
  authMiddleware,
  upload.array('image', 4),
  selectController.postSelect
);

// 선택글 모두 조회
router.get('/', selectController.getAllSelect);

// 선택글 정렬(인기순)
router.get('/filter', selectController.getFilter);

// 선택글 카테고리별 조회
router.get('/category/:category', selectController.getCategory);

// 진행중인 선택글 조회
router.get('/ongoing', selectController.getOngoing);

// 선택글 검색
router.get('/search', selectController.searchSelect);

// 선택글 상세조회
router.get('/:selectKey', selectController.getDetailSelect);

// 선택글 삭제
router.delete('/:selectKey', authMiddleware, selectController.deleteSelect);

module.exports = router;
