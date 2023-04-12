const express = require('express');
const admin_route = express();
const session = require('express-session');
const config = require('../config/config');


// admin_route.use(session({secret:config.sessionSecret}));
admin_route.use(session({
    secret: 'thisismysessionsecret',
    resave: false,
    saveUninitialized: false
}));

const bodyParser = require('body-parser');

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/Images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})

const upload = multer({ storage: storage });




const storageCategory = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/categoryImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})

const uploadCategory = multer({ storage: storageCategory });

// brand
const storageBrand = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/BrandImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})

const uploadBrand = multer({ storage: storageBrand });



admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');
// admin_route.set('views','./views/admin/products');


const auth = require("../Middleware/adminAuth");

const adminController = require('../controllers/adminController');


admin_route.get('/', auth.is_Logout, adminController.loadLogin);

admin_route.post('/', adminController.verifyLogin);

admin_route.get('/home', auth.is_Login, adminController.loadDashboard);

admin_route.get('/user', auth.is_Login, adminController.loadUser);

admin_route.get('/logout', auth.is_Login, adminController.logout);

admin_route.get('/forget', auth.is_Logout, adminController.forgetLoad);

admin_route.post('/forget', adminController.forgetVerify);

admin_route.get('/forget-password', auth.is_Logout, adminController.forgetPasswordLoad);

admin_route.post('/forget-password', adminController.resetPassword);

admin_route.get('/block_user', auth.is_Login, adminController.blockUser);

admin_route.get('/unblock_user', auth.is_Login, adminController.unblockUser);

admin_route.get('/productform', auth.is_Login, adminController.ProductForm);
admin_route.post('/productform', upload.array('image', 3), adminController.ProductInsert);
admin_route.get('/productList', auth.is_Login, adminController.productList);
admin_route.get('/editProduct',auth.is_Login,adminController.editproduct)
admin_route.post('/editProduct',auth.is_Login,adminController.editingProduct)
// delete product image and update
admin_route.get('/delete-product-image/:imgid/:prodid',adminController.deleteImage)
admin_route.post("/edit-image/:id",upload.array('image'), adminController.updateImage)


admin_route.get('/categoryList', auth.is_Login, adminController.categoryList);
admin_route.get('/categoryAdd', auth.is_Login, adminController.categoryAdd);
admin_route.post('/categoryAdd', auth.is_Login, uploadCategory.single('image'), adminController.categoryInsert);
admin_route.get('/deleteProduct', auth.is_Login, adminController.deleteProduct);
admin_route.get('/deleteCategory', auth.is_Login, adminController.deleteCategory);
admin_route.get('/editCategory', auth.is_Login, adminController.editcategory);
admin_route.post('/editCategory', auth.is_Login, adminController.updatecategory);
admin_route.post('/addimage', uploadCategory.single('image'),adminController.updateCateImage)

admin_route.get('/deleteBrand', auth.is_Login, adminController.deleteBrand);
admin_route.get('/brandList', auth.is_Login, adminController.brandList);
admin_route.get('/brandAdd', auth.is_Login, adminController.brandAdd);
admin_route.post('/brandAdd', auth.is_Login, uploadBrand.single('image'), adminController.brandInsert);
admin_route.post('/addBrandImage', uploadBrand.single('image'),adminController.updateBrandImage)
admin_route.get('/editbrand', auth.is_Login, adminController.editbrand)
admin_route.post('/editbrand', auth.is_Login, adminController.updatebrand)


admin_route.get('/couponList', auth.is_Login, adminController.couponList);
admin_route.get('/couponAdd', auth.is_Login, adminController.couponAdd);
admin_route.post('/couponAdd', auth.is_Login, adminController.couponInsert);
admin_route.get('/couponEdit', auth.is_Login,adminController.couponEdit)
admin_route.post('/couponEdit', auth.is_Login,adminController.updateCoupon)
admin_route.post('/couponDelete',auth.is_Login,adminController.deletecoupon);


// order
admin_route.get('/order',adminController.loadOrderlist)

admin_route.get('/orderStatus-placed', auth.is_Login,adminController.placeOrder)
admin_route.get('/orderStatus-shiped',auth.is_Login,adminController.shipedOrder)
admin_route.get('/orderStatus-delivered',auth.is_Login,adminController.deliveredOrder)
admin_route.get('/orderStatus-returnSuccess',auth.is_Login,adminController.orderReturnSuccess)
admin_route.get('/orderStatus-returnCancelled',adminController.orderReturnCancelled)
admin_route.get('/order-view',auth.is_Login,adminController.previewProduct)

// sales report
admin_route.get('/salesReport',auth.is_Login,adminController.salesReport)
admin_route.post('/show-salesreport',auth.is_Login,adminController.showSalesReprot)

// OFFER MANAGEMENT
admin_route.get('/offerManagement',auth.is_Login,adminController.loadOfferManagement)
admin_route.post('/addOfferManagement/:id',auth.is_Login,adminController.addOfferManagement)
admin_route.delete('/deleteOfferManagement',auth.is_Login,adminController.deleteOfferManagement)
admin_route.get('/editOfferManagement/:id',auth.is_Login,adminController.editOfferManagement)
admin_route.post('/updateOffermanagement/:id',auth.is_Login,adminController.updatedOfferManagement)


admin_route.use(session({
    secret: 'thisismysessionsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 3600000 // 1 hour in milliseconds
    }
  }));

// admin_route.get('/product',adminController.loadProduct);

// admin_route.get('*',function(req,res){

//     res.redirect('/admin');

// })

module.exports = admin_route;



























































































































































































































































































































