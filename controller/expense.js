const Expense = require('../models/expense');
const mongoose = require('mongoose');

exports.getExpense=async (req, res) => {
    try {
      const page = +req.query.page || 1;
      const itemsPerPage = +req.query.itemsPerPage || 2;

      const totalNoExense = await Expense.countDocuments({ userId: req.user._id });

      const expenses = await Expense.find({ userId: req.user._id })
          .skip((page - 1) * itemsPerPage)
          .limit(itemsPerPage)

      res.status(200).json({
        expenses:expenses,
        currentPage:page,
        nextPage:page+1,
        previousPage:page-1,
        HasNextPage:itemsPerPage*page < totalNoExense,        
        hasPreviousPage:page>1,        
        lastPage:Math.ceil(totalNoExense/itemsPerPage),  //Math.ceil() ensures that even if there’s a fraction of a page left 
                                                      // it rounds up to the next whole number to ensure all items are displayed.
      });
    } catch (err) { 
      console.error('Error fetching expenses:', err);
      res.status(500).json({ err: 'Failed to fetch expenses' });
    }
}

exports.postExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const { amount, description, category } = req.body;
      const newExpense = new Expense({ 
          amount, 
          description, 
          category,
          userId: req.user._id
      });

      await newExpense.save({ session });

      const totalAmount = req.user.totalExpense + parseInt(amount);
      req.user.totalExpense = totalAmount; 
      await req.user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(newExpense);
  } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error creating expense:', err);
      res.status(500).json({ err: 'Failed to create expense' });
  }
};


exports.deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const expenseId = req.params.expenseId;

      const currentExpense = await Expense.findOne({ _id: expenseId, userId: req.user._id }).session(session);
      if (!currentExpense) {
          throw new Error('Expense not found');
      }

      await Expense.deleteOne({ _id: expenseId, userId: req.user._id }).session(session);

      // Update total expense
      req.user.totalExpense -= currentExpense.amount;
      await req.user.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(204).end();
  } catch (err) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error deleting expense:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};