const bodyParser = require("body-parser");
const express = require("express")
const user_route = express();
const session = require('express-session');
const config  = require("../config/config");


user_route.use(session({
  secret: 'thisismysessionsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000 // 1 hour in milliseconds
  }
}));



// user_route.use(session({secret:config.sessionSecret}));

user_route.use(session({
    secret: 'thisismysessionsecret',
    resave: false,
    saveUninitialized: false
  }));

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


// otp
user_route.get('/phoneNum',auth.isLogout, userController.phoneCheck);
user_route.post('/phoneNum',userController.sentOTP);

// user_route.get('/otp',userController.verifyOTP);

user_route.post('/otp',userController.verifyOTP);

// user side
// product detail
user_route.get('/productDetails',auth.isLogin,userController.productDetails);
// wishlist
user_route.get('/wishlist',auth.isLogin,userController.loadWishlist);
user_route.post('/add-to-wishlist',auth.isLogin,userController.addToWishlist)
user_route.post('/deleteWishlist',auth.isLogin,userController.deleteWishlist)
// user profile
user_route.get('/userProfile',auth.isLogin,userController.loaduserprofile)
user_route.post('/addaddress',auth.isLogin,userController.insertAddress) 

// user cart
user_route.get('/cart',auth.isLogin,userController.loadCart);
user_route.post('/add-to-cart',auth.isLogin,userController.AddToCart);
user_route.post('/deletecart',auth.isLogin,userController.deletecart);
user_route.post('/change-quantity',auth.isLogin,userController.change_Quantities);


// checkout-address

user_route.get('/checkoutAddress',auth.isLogin,userController.checkoutAddress)
user_route.post('/addCheckoutAddress',auth.isLogin,userController.addCheckoutAddress)


module.exports = user_route;