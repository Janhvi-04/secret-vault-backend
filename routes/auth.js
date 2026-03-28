const express=require('express');
const router=express.Router();
const User=require('../models/User');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const auth=require('../middleware/auth');
const crypto=require('crypto');
const sendEmail=require('../utils/sendEmail')
const {validateRegistration, validateLogin, validateResetPassword}=require('../utils/validators.js');
router.post('/register',async(req,res)=>{
    try{
        const error = validateRegistration(req.body);
        if (error) {
            return res.status(400).json({ msg: error });
        }
        const { username, password } = req.body;
        const existingUser=await User.findOne({username});
        if(existingUser) return res.status(400).json({msg: "User already exists"});
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User({
            username,
            password: hashedPassword
        });
        const savedUser=await newUser.save();
        res.status(201).json({msg: "User registered successfully!",userId: savedUser._id });
    } catch(err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
});
router.post('/login',async(req,res)=>{
    try {
        const error = validateLogin(req.body);
        if (error) {
            return res.status(400).json({ msg: error });
        }
        const {username,password}=req.body;
        //find user
        const user=await User.findOne({username});
        if(!user) return res.status(400).json({msg: "User does not exist"});
        //compare password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials"});
        const token=jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
        res.json({
            token,
            user: {id: user._id,username: user.username}
        });
    } catch (error) {
        res.status(500).json({error:error.message});
    }
})
router.post('/forgot-password',async(req,res)=>{
    console.log("Request Body:", req.body);
    try {
        const {username}=req.body;
        const user=await User.findOne({username});
        console.log("User Found in DB:", user);
        if(!user) return res.status(404).json({msg: "User not found"});
        const resetToken=crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken=resetToken;
        user.resetPasswordExpires=Date.now()+3600000;
        await user.save();
        const resetUrl=`/reset-password/${resetToken}`;
        const message=`You are receiving this because you requested a password reset.\n\nPlease click on the following link to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email`
        try {
            await sendEmail({
                email: user.username,
                subject: 'Secret Vault Password Reset',
                message
            });
            res.json({msg: "Email sent successfully to your inbox!"});
        } catch (err) {
            user.resetPasswordToken=undefined;
            user.resetPasswordExpires=undefined;
            await user.save();
            return res.status(500).json({msg: "Email could not be sent"});
        }
    } catch (err) {
        res.status(500).json({error:err.message});
    }
});
router.post('/reset-password/:token',async(req,res)=>{
    try {
        const {password}=req.body;
        const error = validateResetPassword(password);
        if (error) {
            return res.status(400).json({ msg: error });
        }
        const user=await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {$gt: Date.now()}
        });
        if(!user) return res.status(400).json({msg: "Invalid or expired token"})
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(req.body.password,salt);
        user.resetPasswordToken=undefined;
        user.resetPasswordExpires=undefined;
        await user.save();
        res.json({msg: "Password reset successfull!"})
    } catch (err) {
        res.status(500).json({error:err.message});
    }
})
// Only a logged-in user can check their own profile.
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});
module.exports=router;