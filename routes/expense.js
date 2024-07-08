const express = require('express');

const router = express.Router();

const expenseController = require('../controller/expense');
const userAuthentication =require('../middleware/auth')

router.get('/get', userAuthentication.authenticate ,expenseController.getExpense);

router.post('/post', userAuthentication.authenticate ,expenseController.postExpense);  
  
router.delete('/:expenseId', userAuthentication.authenticate ,expenseController.deleteExpense );

module.exports = router;