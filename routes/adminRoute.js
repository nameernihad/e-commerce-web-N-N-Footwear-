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




    const storageCategory = multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,'../public/categoryImages'));
        },
        filename:function(req,file,cb){
            const name =Date.now()+'-'+file.originalname;
            cb(null,name);
        }
    })

const uploadCategory = multer({storage:storageCategory});



admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');
// admin_route.set('views','./views/admin/products');


const auth = require("../Middleware/adminAuth");

const adminController = require('../controllers/adminController');


admin_route.get('/', auth.is_Logout, adminController.loadLogin);

admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home', auth.is_Login, adminController.loadDashboard);

admin_route.get('/user',adminController.loadUser);

admin_route.get('/logout', auth.is_Login,adminController.logout);

admin_route.get('/forget', auth.is_Logout,adminController.forgetLoad);

admin_route.post('/forget',adminController.forgetVerify);

admin_route.get('/forget-password', auth.is_Logout,adminController.forgetPasswordLoad);

admin_route.post('/forget-password',adminController.resetPassword);

admin_route.get('/block_user',auth.is_Login, adminController.blockUser);

admin_route.get('/unblock_user',auth.is_Login,adminController.unblockUser);

admin_route.get('/productform',auth.is_Login,adminController.ProductForm);

admin_route.post('/productform',upload.single('image'), adminController.ProductInsert);

admin_route.get('/productList',auth.is_Login,adminController.productList);

admin_route.get('/categoryList',auth.is_Login,adminController.categoryList);

admin_route.get('/categoryAdd',auth.is_Login,adminController.categoryAdd);

admin_route.post('/categoryAdd',uploadCategory.single('image'),adminController.categoryInsert);

admin_route.get('/deleteProduct',auth.is_Login,adminController.deleteProduct);

admin_route.get('/deleteCategory',auth.is_Login,adminController.deleteCategory);

admin_route.get('/deleteBrand',auth.is_Login,adminController.deleteBrand);

admin_route.get('/brandList',adminController.brandList);

admin_route.get('/brandAdd',adminController.brandAdd);

admin_route.post('/brandAdd',adminController.brandInsert);

admin_route.get('/couponAdd',adminController.couponAdd);




// admin_route.get('/product',adminController.loadProduct);

// admin_route.get('*',function(req,res){

//     res.redirect('/admin');
    
// })

module.exports = admin_route;



























































































































































































































































































































