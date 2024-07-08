const express = require('express');

const router = express.Router();

const userController = require('../controller/user');

router.post('/signup', userController.signupUser);

router.get('/login/:email/:password',userController.loginUser);

module.exports = router;
 