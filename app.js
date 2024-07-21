const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
const mongoose=require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

const adminRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes=require('./routes/premium');
const forgotRoutes=require('./routes/forgetpassword')

app.use('/user',adminRoutes);
app.use('/expenses',expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium',premiumRoutes);
app.use('/password',forgotRoutes);

app.use((req, res) => {
  if (req.url === '/') {
    res.sendFile(path.join(__dirname, 'public', 'signup', 'signup.html'));
  } else if (req.url === '/styles.css') {
    res.sendFile(path.join(__dirname, 'public', 'signup', 'styles.css'));
  } else if (req.url === '/signup.js') {
    res.sendFile(path.join(__dirname, 'public', 'signup', 'signup.js'));
  } else {
    res.sendFile(path.join(__dirname, 'public', req.url));
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Connection error', err);
  }
};

startServer();