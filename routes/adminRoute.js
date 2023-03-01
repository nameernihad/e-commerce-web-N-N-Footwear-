const express = require('express');
const admin_route = express();
const session = require('express-session');
const config = require('../config/config');


admin_route.use(session({secret:config.sessionSecret}));


const bodyParser = require('body-parser');

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

const multer =  require('multer');
const path = require('path');
    const storage = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,'../public/Images'));
        },
        filename:function(req,file,cb){
            const name =Date.now()+'-'+file.originalname;
            cb(null,name);
        }
    })

const upload = multer({storage:storage});



admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');
// admin_route.set('views','./views/admin/products');


const auth = require("../Middleware/adminAuth");

const adminController = require('../controllers/adminController');


admin_route.get('/', auth.isLogout, adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home', auth.isLogin, adminController.loadDashboard);

admin_route.get('/user',adminController.loadUser);

admin_route.get('/logout', auth.isLogin,adminController.logout);

admin_route.get('/forget', auth.isLogout,adminController.forgetLoad);

admin_route.post('/forget',adminController.forgetVerify);

admin_route.get('/forget-password', auth.isLogout,adminController.forgetPasswordLoad);

admin_route.post('/forget-password',adminController.resetPassword);

admin_route.get('/block_user',adminController.blockUser);

admin_route.get('/unblock_user',adminController.unblockUser);

admin_route.get('/productform',adminController.ProductForm);

admin_route.post('/productform',upload.single('image'), adminController.ProductInsert);

admin_route.get('/productList',adminController.productList);


// admin_route.get('/product',adminController.loadProduct);

// admin_route.get('*',function(req,res){

//     res.redirect('/admin');
    
// })

module.exports = admin_route;



























































































































































































































































































































