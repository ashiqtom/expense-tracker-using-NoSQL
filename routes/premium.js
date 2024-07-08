const express = require('express');

const router = express.Router();

const premiumController = require('../controller/premium');

const authenticatemiddleware = require('../middleware/auth');

router.get('/leaderBoard',authenticatemiddleware.authenticate,premiumController.getPremium);

router.get('/download',authenticatemiddleware.authenticate,premiumController.download);

router.get('/downloadRecoard',authenticatemiddleware.authenticate,premiumController.downloadRecoard);

module.exports = router;