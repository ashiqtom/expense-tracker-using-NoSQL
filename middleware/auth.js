const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.authenticate=async(req,res,next)=>{
    try{        
        const token=req.header('authorization');
        const user=jwt.verify(token,process.env.jwtSecretkey);
               
        const userDetails=await User.findById(user.userId)
        if(!userDetails){
            return res.status(400).json({err:'Invalid userid'});
        }
        
        req.user=userDetails;
        
        next();
    } catch(err){
        console.log(err); 
        return res.status(401).json({success:false});
    }
}