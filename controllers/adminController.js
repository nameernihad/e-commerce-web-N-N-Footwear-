const User = require("../model/userModel");
const Product = require('../model/productModel');
const Brand = require('../model/Brand')
const Category = require('../model/Category');
const Coupon = require('../model/coupon')
const randomstring = require('randomstring');
const config = require("../config/config");
const nodemailer = require('nodemailer');
const bycrpt = require('bcrypt');

// password securing 
const securePassword = async (password) => {

    try {

        const passwordHash = await bycrpt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}


// for reset password sent mail


const sentResetPassword = async (name, email, token) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password ',
            html: '<p>hay ' + name + ',please click here to <a href="http://localhost:8080/admin/forget-password?token=' + token + '">Reset</a> your password.</p>'

        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error.message);



            }
            else {
                console.log("Email has been sent:- ", info.response);
            }

        });

    } catch (error) {
        console.log(error.message);

    }



}





const loadLogin = async (req, res) => {

    try {

        res.render('admin_login');


    } catch (error) {
        console.log(error.message);
        console.log("loginload error");
    }


}

const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const adminData = await User.findOne({ email: email });

        if (adminData) {

            const passwordMatch = await bycrpt.compare(password, adminData.password);
            if (passwordMatch) {

                if (adminData.is_admin === 0) {

                    res.render('admin_login', { message: "You are not admin." })
                }
                else {

                    req.session.admin_id = adminData._id;
                    res.render('admin_home')
                }


            }
            else {
                res.render('admin_login', { message: "Email and password is incorrect." })

            }

        }
        else {

            res.render('admin_login', { message: "Email and password is incorrect." })

        }

    } catch (error) {
        console.log(error.message);
        console.log("admin verifylogin");
    }


}

const loadDashboard = async (req, res) => {

    try {

        res.render('admin_home');


    } catch (error) {
        console.log(error.message);
        console.log("loadDashboard admin");
    }

}

const loadUser = async (req, res) => {

    try {

        const userData = await User.find({ is_admin: 0 });
        console.log(userData);
        res.render('user_managment', { users: userData });

    } catch (error) {
        console.log(error.message);
        console.log("loadUser");
    }


}

const logout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/admin')


    }
    catch (error) {
        console.log(error.message);
        console.log("logout");
    }
}

const forgetLoad = async (req, res) => {

    try {

        res.render("admin _forget")


    } catch (error) {
        console.log(error.message);
        console.log("forgetLoad");
    }
}

const forgetVerify = async (req, res) => {

    try {

        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {

            if (userData.is_admin === 0) {
                res.render('admin _forget', { message: "Email is incorrect" });
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } })
                sentResetPassword(userData.name, userData.email, randomString);
                res.render('admin _forget', { message: " Check Your Mail to reset your password" })
            }

        } else {
            res.render('admin _forget', { message: "Email is incorrect" });
        }


    } catch (error) {
        console.log(error.message);
        console.log("forgetverify");
    }
}

const forgetPasswordLoad = async (req, res) => {

    try {

        const token = req.query.token;

        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });

        } else {
            res.render('404')
        }


    } catch (error) {
        console.log(error.message);
        console.log("forgetPasswordLoad");
    }

}

const resetPassword = async (req, res) => {
    try {

        const password = req.body.password;
        const user_id = req.body.user_id;
        console.log(password);
        const securepassword = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: securepassword, token: '' } })

        res.redirect('/admin');
    }
    catch (error) {
        console.log(error.message);
        console.log("resetpassword");
    }
}

const blockUser = async (req, res) => {
    try {

        const id = req.query.id;
        const blockedUser = await User.findByIdAndUpdate({ _id: id }, { $set: { block: true } });
        res.redirect('/admin/user')

    }
    catch (error) {
        console.log(error.message);
    }
}


const unblockUser = async (req, res) => {
    const userid = req.query.id;
    const unblockedUser = await User.findByIdAndUpdate({ _id: userid }, { $set: { block: false } });
    res.redirect('/admin/user')
}

const ProductForm = async (req, res) => {
    try {

        //   if(req.session.admin)
        const categoryDetailes = await Category.find({})
        console.log(categoryDetailes);
        const brandDetailes = await Brand.find({})
        console.log(brandDetailes);
        res.render('productAdd', {
            categories: categoryDetailes,
            brands: brandDetailes
        });
    }
    catch (error) {
        console.log(error.message);
        console.log("productAdd");
    }
}

const productList = async (req, res) => {
    try {
        const productData = await Product.find();
        res.render('product-List', { products: productData });


    }
    catch (error) {
        console.log(error.message);
        console.log("pro list")
    }
}

const ProductInsert = async (req, res) => {
    try {

        const Images = []

        for (file of req.files) {
            Images.push(file.filename)
        }
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            discription: req.body.Discription,
            Image: Images,
            category: req.body.Category,
            brand: req.body.brand,
            quantity: req.body.quantity,
        })
        console.log(Images);
        const productData = await product.save();
        res.redirect('/admin/productform')

    }
    catch (error) {
        console.log(error.message);
        console.log("pro -insert");
    }
}

const categoryList = async (req, res) => {
    try {

        const categoryData = await Category.find();
        res.render('categoryList', { categorys: categoryData });


    }
    catch (error) {
        console.log(error.message);
        console.log("category list");
    }
}

const categoryInsert = async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name,
            image: req.file.filename,
            discription: req.body.discription,
        })

        const categoryData = await category.save();
        res.redirect('/admin/categoryAdd')
    }
    catch (error) {
        console.log(error.message);
        console.log("cat - insert");
    }
}


const categoryAdd = async (req, res) => {
    try {

        res.render('categoryAdd');

    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async (req, res) => {

    try {

        const product_id = req.query.id
        await Product.deleteOne({ _id: product_id });
        res.redirect('/admin/productList')

    }
    catch (error) {
        console.log(error.message);
        console.log("deleteProduct");
    }

}

const deleteCategory = async (req, res) => {

    try {

        const category_id = req.query.id
        await Category.deleteOne({ _id: category_id });
        res.redirect('/admin/categoryList')

    }
    catch (error) {
        console.log(error.message);
        console.log("deleteProduct");
    }

}

const deleteBrand = async (req, res) => {

    try {

        const Brand_id = req.query.id
        await Brand.deleteOne({ _id: Brand_id });
        res.redirect('/admin/brandList')

    }
    catch (error) {
        console.log(error.message);
        console.log("deleteProduct");
    }

}


const brandList = async (req, res) => {
    try {


        const brandData = await Brand.find();
        res.render('brand-list', { brands: brandData });


    }
    catch (error) {
        console.log(error.message);
        console.log("brandlist");
    }
}

const brandAdd = async (req, res) => {
    try {


        res.render('BrandAdd');

    }
    catch (error) {
        console.log(error.message);
        console.log("brand add");
    }
}

const brandInsert = async (req, res) => {
    try {

        const brand = new Brand({
            name: req.body.name,
            image: req.file.filename,
            discription: req.body.discription,
        })

        const brandData = await brand.save();
        res.redirect('/admin/brandAdd')


    } catch (error) {
        console.log(error.message);
        console.log("brand insert");
    }

}


const couponList = async (req, res) => {
    try {
        const coupondata = await Coupon.find({});
        console.log(coupondata);
        res.render("couponList", { coupondata })

    } catch (error) {
        console.log(error.message);
        console.log("coupon list");
    }
}

const couponAdd = async (req, res) => {
    try {

        res.render("couponAdd")


    } catch (error) {
        console.log(error.message);
        console.log("coupon add");
    }
}

const couponInsert = async (req, res) => {
    try {

        const coupon = new Coupon({

            couponCode: req.body.couponCode,
            couponAmountType: req.body.couponAmountType,
            couponAmount: req.body.couponAmount,
            minRedeemAmound: req.body.minRedeemAmound,
            minCartAmount: req.body.minCartAmount,
            expiryDate: req.body.expiryDate,
            startDate: req.body.startDate,
            limit: req.body.limit,
        })
        const couponData = await coupon.save();
        console.log(couponData);
        if (couponData) {
            res.redirect('/admin/couponAdd')
        }

    } catch (error) {
        console.log(error.message);
        console.log("coupon data");
    }
}

const editcategory = async (req, res) => {
    try {
        const id = req.query.id

        const category = await Category.findOne({ _id: id })
        res.render('editCategoryForm', { category });


    } catch (error) {
        console.log(error.message);
        console.log("edit category");
    }
}

const updatecategory = async (req, res) => {
    try {

        const id = req.query.id
        console.log(id);
        const updatedData = await Category.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, discription: req.body.discription, } });
        res.redirect('/admin/categoryList')

    } catch (error) {
        console.log(error.message);
        console.log("update category");
    }
}

const editImages = async (req, res) => {
    try {

        const id = req.query.id;
        console.log(id)
        const Image = req.file.filename;
        console.log(Image)
        const result = await Category.findByIdAndUpdate({ _id: id }, { $set: { image: Image } })
        res.redirect('/admin/categoryList')


    } catch (error) {
        console.log(error.message);
        console.log("editimage");
    }
}


const editbrand = async (req, res) => {
    try {

        const id = req.query.id

        const brand = await Brand.findOne({ _id: id })
        console.log(brand);
        res.render('editbrand', { brand });


    } catch (error) {
        console.log(error.message);
        console.log("editbrand");
    }
}

const updatebrand = async(req,res)=>{
    try {
        
        const id = req.query.id
        console.log(req.body.name);
        const updatedData = await Brand.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, discription: req.body.discription } });
        console.log(updatedData)
        if(updatedData){
             res.redirect('/admin/brandList')
        }
       


    } catch (error) {
        console.log(error.message);
        console.log("updatebrand")
    }
}

const couponEdit = async(req,res)=>{
    try {
        
        const id = req.query.id
        console.log(id);
        const coupon = await Coupon.findOne({ _id: id })
       
        res.render('couponedit', { coupon });

    } catch (error) {
        console.log(error.message);
    }
}

const updateCoupon = async(req,res)=>{
    try {
        id=req.query.id;


        const updatedData = await Coupon.findByIdAndUpdate({_id:id},{$set:{
            couponCode: req.body.couponCode,
            couponAmountType: req.body.couponAmountType,
            couponAmount: req.body.couponAmount,
            minRedeemAmound: req.body.minRedeemAmound,
            minCartAmount: req.body.minCartAmount,
            expiryDate: req.body.expiryDate,
            startDate: req.body.startDate,
            limit: req.body.limit,
        }})
        console.log(updateCoupon);
        if(updatedData){
            res.redirect('/admin/couponList')
        }


    } catch (error) {
        console.log(error.message);
    }
}

const deletecoupon = async(req,res)=>{
    try {
        
        id=req.query.id;

        const deletecpn = await Coupon.findByIdAndDelete({_id:id})
        res.redirect('/admin/couponList')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUser,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    blockUser,
    unblockUser,
    ProductForm,
    productList,
    ProductInsert,
    categoryList,
    categoryInsert,
    categoryAdd,
    deleteProduct,
    brandList,
    brandAdd,
    brandInsert,
    deleteCategory,
    deleteBrand,
    couponList,
    couponAdd,
    editcategory,
    updatecategory,
    couponInsert,
    editImages,
    editbrand,
    updatebrand,
    couponEdit,
    updateCoupon,
    deletecoupon
}



