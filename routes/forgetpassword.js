const express = require('express');

const router = express.Router();

const forgotController = require('../controller/forgotpassword');

router.post('/forgotpassword',forgotController.forgot)

router.get('/resetpassword/:id',forgotController.resetpassword)

router.get('/updatepassword/:id',forgotController.updatepassword)

module.exports = router;
 