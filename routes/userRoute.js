const bodyParser = require("body-parser");
const express = require("express")
const user_route = express();
const session = require('express-session');
const config  = require("../config/config");


user_route.use(session({secret:config.sessionSecret}));

// user_route('./sent-otp').post(sentOTP);
// user_route('./verify-otp').post(verifyOTP);


const auth = require('../Middleware/auth');

user_route.set('view engine','ejs');

user_route.set('views','./views/users');

user_route.use(bodyParser.json());

user_route.use(bodyParser.urlencoded({extended:true}))

const userController = require("../controllers/userController");

user_route.get('/register',auth.isLogout,userController.loadRegister);

user_route.post('/register',userController.insertUser);

user_route.get('/verify',userController.VerifyMail);

user_route.get('/',auth.isLogout,userController.loginload);

user_route.get('/login',auth.isLogout,userController.loginload);

user_route.post('/login',userController.verifyLogin);

user_route.get('/home',auth.isLogin,userController.loadHome);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/forget',auth.isLogout,userController.forgetLoad);

user_route.post('/forget',userController.forgetverify);

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);

user_route.post('/forget-password',userController.resetPassword);

user_route.get('/verification',userController.verificationLoad);

user_route.post('/verification',userController.sendVerification);

user_route.get('/phoneNum',auth.isLogout, userController.phoneCheck);

user_route.post('/phoneNum',userController.sentOTP);

// user_route.get('/otp',userController.verifyOTP);

user_route.post('/otp',userController.verifyOTP);





module.exports = user_route;