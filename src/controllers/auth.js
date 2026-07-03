const User=require('../models/User')
const jwt=require('jsonwebtoken')
const tokenBlacklistModel = require("../models/Blacklist")


async function userRegisterController(req,res){
    
    const {email,password,name}=req.body;

    const isExist=await User.findOne({email});

    if(isExist){
        return res.status(422).json({
            message:"User already exist",
            status:"failed"
        })
    }

    const user=await User.create({
        email,name,password
    })

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'3d'})
    res.cookie("token",token,{
        httpOnly:true
    });
    
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })


}
async function userLoginController(req,res){    
    
    const {email,password}=req.body;

    const user=await User.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({
            message:"Email or password is invalid",
        })
    }

    const isValidPassword=user.comparePassword(password);
    if(!isValidPassword){
        return res.status(401).json({
            message:"Email or password is invalid",
        })
    }

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'3d'})
    res.cookie("token",token,{
        httpOnly:true
    });


    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })


}

async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if (!token) {
        return res.status(200).json({
            message: "User logged out successfully"
        })
    }



    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })

}


module.exports={
    userRegisterController,
    userLoginController,
    userLogoutController
}