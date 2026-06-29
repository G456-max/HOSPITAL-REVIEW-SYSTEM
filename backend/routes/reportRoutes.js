const express = require('express');
const router = express.Router();
const { exportExcel, exportPdf } = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');

router.get('/excel', protect, exportExcel);
router.get('/pdf', protect, exportPdf);

module.exports = router;
