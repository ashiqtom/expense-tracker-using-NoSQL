
const S3Services=require('../services/S3services');

const FileDownloaded = require('../models/filesDownloaded');
const User = require('../models/user');
const Expense = require('../models/expense');

exports.downloadRecoard = async (req, res) => { 
  try {
    if (req.user.isPremiumUser) {
      const downloadRecords = await FileDownloaded.find({ userId: req.user._id });
      res.status(201).json(downloadRecords);
    } else {
      res.status(401).json({ success: false, message: "Unauthorized: You are not a premium user" });
    }
  } catch (err) {
    console.error('Error fetching:', err);
    res.status(500).json({ error: 'Failed to fetch', err });
  }
};


exports.download = async (req, res) => { 
  try {
    if (req.user.isPremiumUser) {
      const expenses = await Expense.find({ userId: req.user._id })
      const stringifiedExpenses = JSON.stringify(expenses);

      const filename = `Expense${req.user.id}/${new Date().toISOString()}.txt`;
      const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);

      await FileDownloaded.create({ url: fileUrl.Location, userId: req.user._id });

      res.status(201).json(fileUrl);
    } else {
      res.status(401).json({ success: false, message: "Unauthorized: You are not a premium user" });
    }
  } catch (err) {
    console.error('Error fetching:', err);
    res.status(500).json({ error: 'Failed to fetch', err });
  }
};
  
exports.getPremium = async (req, res) => {
  try {
    if (req.user.isPremiumUser) {
      const totalExpense = await User.find({})
        .select("username totalExpense")
        .sort({ totalExpense: -1 });
      res.status(200).json(totalExpense);
    } else {
      res.status(401).json({ success: false, message: "Unauthorized: You are not a premium user" });
    }
  } catch (err) {
    console.error('Error fetching:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};
