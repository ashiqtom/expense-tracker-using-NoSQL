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

// app.use((req,res,next)=>{
//   console.log(req.url)
//   next()
// })

app.use('/user',adminRoutes);
app.use('/expenses',expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium',premiumRoutes);
app.use('/password',forgotRoutes);

app.use((req,res)=>{
  // console.log(req.url)
  res.sendFile(path.join(__dirname,`public/${req.url}`));
})

mongoose
  .connect(process.env.dbUrl)
  .then(()=>{
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });