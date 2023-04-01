const User = require('../model/userModel');

const Address = require('../model/address');

const Order = require('../model/OrderModel');

const coupon = require('../model/coupon');

const product = require('../model/productModel');

const category = require('../model/Category');

const brand = require('../model/Brand');

const { unsubscribe } = require('../routes/userRoute');

const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');

const config = require('../config/config');

const Randormstring = require('Randomstring');

const { json } = require('body-parser');

const mongoose = require('mongoose');

const { findByIdAndDelete, findByIdAndUpdate } = require('../model/userModel');

const Razorpay = require('razorpay');

const crypto = require('crypto')


const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})


// sent otp;


console.log(product)




// password securing 
const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }

}

// for sent mail
const sentVerifyMail = async (name, email, user_id) => {

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
            subject: 'For verification mail',
            html: '<p>hay ' + name + ',please click here to <a href="http://localhost:8080/verify?id=' + user_id + '">verify</a> your mail.</p>'

        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error)


            }
            else {
                console.log("Email has been sent:- ", info.response);
            }

        });

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
            html: '<p>hay ' + name + ',please click here to <a href="http://localhost:8080/forget-password?token=' + token + '">Reset</a> your password.</p>'

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



const loadRegister = async (req, res) => {
    try {
        res.render('registration');


    } catch (error) {
        console.log(error.message);

    }
}



const insertUser = async (req, res) => {

    try {

        const spassword = await securePassword(req.body.password);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: spassword,
            is_admin: 0
        })

        const userData = await user.save();

        if (userData) {

            sentVerifyMail(req.body.name, req.body.email, userData._id);


            res.render("registration", { message: "   Congratulations, Verifivation message is sended, please verify your email.." });
            message == null;
        } else if (email === "" || password === "") {
            res.redirect('/register', { message: "enter valid inputs" })
        }
        else {
            res.render("registration", { message: "Oops something wrong..." });
            message == null;
        }

    } catch (error) {
        console.log(error.message);
    }

}

const VerifyMail = async (req, res) => {
    try {

        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        console.log(updateInfo);
        res.render("email-verified");

    } catch (error) {
        console.log(error.message);

    }
}



const phoneCheck = async (req, res) => {
    try {
        console.log('phonecheck');
        res.render('phoneNumber', { message: "" });

    }
    catch (error) {
        console.log(error.message);
        console.log("phonecheck error");
    }

}


const sentOTP = async (req, res, next) => {
    console.log("otp sent");

    try {
        console.log('setotp');
        const num = req.body.phone;

        const check = await User.findOne({ phone: num })

        if (check) {
            console.log("checkotp");
            const otpResponse = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to: num,
                    channel: "sms",
                });
            console.log("otp sented");
            res.render('otp', { message: num });

        }
        else {
            res.render('phoneNumber', { message: 'This Number Is Not Registerd' })
        }
    } catch (error) {
        console.log(error.message);
        console.log("sentOTP error");

    }

};


const verifyOTP = async (req, res, next) => {
    console.log("verifyOTP");
    try {
        console.log("otp verification");
        const num = req.body.phone;
        const otp = req.body.otp;
        console.log("phone&otp");
        console.log(otp + "" + num);
        const verifiedResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: num,
                code: otp,
            });
        if (verifiedResponse.status == 'approved') {
            const userDetails = User.findOne({ phone: num })
            req.session.user_id = userDetails._id
            res.render('user_home');
            console.log("otp goted");

        } else {
            res.render('otp', { message: "incorrect otp" });
            console.log("otp false");
        }

    }
    catch (error) {
        console.log(error.message);
    }
}






// login user login method started

const loginload = async (req, res) => {
    try {
        res.render('user_login')

    } catch (error) {
        console.log(error.message);
    }



}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData.is_admin === 1) {
            res.redirect('/admin')
        }
        else if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {

                if (userData.is_verified === 0 || userData.block === true) {

                    res.render('user_login', { message: "Please verify your mail." })
                }
                else {

                    req.session.user_id = userData._id;

                    res.redirect('/home');
                }

            }
            else {
                res.render('user_login', { message: "Your Email and Password are incorrect" });
            }


        } else if (password === "" || email === "") {
            res.render('user_login', { message: "Enter valid inputs" });
        }
        else {
            res.render('user_login', { message: "Your Email or password is not valid" });
        }




    } catch (error) {
        console.log(error.message);
        console.log("login error");
    }
}


const loadHome = async (req, res) => {

    try {
        Id = req.session.user_id;

        const Product = await product.find({});
        const Category = await category.find({});
        const Brand = await brand.find({});
        const userdata = await User.findOne({ _id: req.session.user_id }).populate('wishlist.product')


        res.render('user_home', { Product, Category, Brand, userdata });

    }
    catch (error) {
        console.log(error.message);
        console.log("load home");

    }


}

const userLogout = async (req, res) => {

    try {

        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }

}


// forget password code

const forgetLoad = async (req, res) => {

    try {

        res.render('forget');


    }
    catch (error) {
        console.log(error.message);
    }

}

const forgetverify = async (req, res) => {

    try {

        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {


            if (userData.is_verified === 0) {

                res.render('forget', { message: "Please Verify Your Mail." })
                message == null;


            }
            else {
                const Randomstring = Randormstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: Randomstring } })
                sentResetPassword(userData.name, userData.email, Randomstring);

                res.render('forget', { message: "Please Check Your Mail Reset Your Password ." })
                message == null;

            }

        } else {
            res.render('forget', { message: "Email Is Not Exist" })
            message == null;
        }


    } catch (error) {
        console.log(error.message);

    }



}

const forgetPasswordLoad = async (req, res) => {

    try {

        const token = req.query.token;
        const tokenData = await User.findOne({ token: token })

        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        }
        else {
            res.render('404', { message: "Token is invalid" });
            message == null;
        }

    } catch (error) {
        console.log(error.message);

    }




}



const resetPassword = async (req, res) => {

    try {

        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);


        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })

        if (updatedData) {
            console.log("password updated");
            res.redirect("/")
        }

    }
    catch (error) {
        console.log(error.meesage);

    }

}

// for verification sent
const verificationLoad = async (req, res) => {

    try {

        res.render('user_verification');



    } catch (error) {
        console.log(error.message);
    }


}

const sendVerification = async (req, res) => {

    try {

        const email = req.body.email;

        const userData = await User.findOne({ email: email });

        if (userData) {

            sentVerifyMail(userData.name, userData.email, userData.user_id);

            res.render('user_verification', { message: "Reset verification mail sent your mail id ,please check " })
            message == null;

        } else {

            res.render('user_verification', { message: "This Email Is Not Exist." })
            message == null;

        }




    } catch (error) {
        console.log(error.message);

    }


}

const productDetails = async (req, res) => {
    try {
        const prodId = req.query.id;

        const Product = await product.findOne({ _id: prodId });

        const allProduct = await product.find({});


        res.render('product-details', { Product, allProduct })

    } catch (error) {
        console.log(error.message);
        console.log("product details");
    }
}


const loadWishlist = async (req, res) => {
    try {
        const id = req.session.user_id
        const userData = await User.findOne({ _id: id }).populate('wishlist.product').exec()

        res.render('wishlist', { userData })

    } catch (error) {
        console.log(error.message);
    }
}


const addToWishlist = async (req, res) => {
    try {
        const productId = req.body.productId


        let exist = await User.findOne({ id: req.session.user_id, 'wishlist.product': productId })
        if (exist) {
            console.log("item allready exist in wishlist");
            res.json({ status: false })
        } else {
            const Product = await product.findOne({ _id: req.body.productId })
            const _id = req.session.user_id
            const userData = await User.findOne({ _id })
            const result = await User.updateOne({ _id: userData }, { $push: { wishlist: { product: Product._id } } })

            if (result) {
                res.json({ status: true })
                res.redirect('/home')
                console.log('added to whislist');
            } else {
                console.log('not addeed to wishlist');
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}



const deleteWishlist = async (req, res) => {
    try {
        const id = req.session.user_id
        const deleteProId = req.body.productId
        const deleteWishlist = await User.findByIdAndUpdate({ _id: id }, { $pull: { wishlist: { product: deleteProId } } })
        if (deleteWishlist) {
            res.json({ success: true })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loaduserprofile = async (req, res) => {
    try {

        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const address = await Address.findOne({ userId: req.session.user_id })

        res.render('userprofile', { userData })

    } catch (error) {
        console.log(error.message);
    }
}

const loadCart = async (req, res) => {
    try {
        console.log("showing cart....");
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart = await User.aggregate([{ $match: { _id: temp } }, { $unwind: '$cart' }, { $group: { _id: null, totalcart: { $sum: '$cart.productTotalPrice' } } }])
        // console.log(usercart);
        if (usercart.length > 0) {
            const cartTotal = usercart[0].totalcart
            // console.log(cartTotal);
            const cartTotalUpdate = await User.updateOne({ _id: userId }, { $set: { cartTotalPrice: cartTotal } })
            // console.log(cartTotalUpdate);
            const userData = await User.findOne({ _id: userId }).populate('cart.productId').exec()
            res.render('cart', { userData })

        } else {
            const userData = await User.findOne({ userId })
            res.render('cart', { userData })
        }


    } catch (error) {
        console.log(error.message);
    }
}


const AddToCart = async (req, res) => {
    try {
        const ProductId = req.body.productId;
        const userid = req.session.user_id
        const exist = await User.findOne({ id: userid, 'cart.productId': ProductId })

        if (exist) {
            console.log("item allready exist in Cart");
            res.json({ status: false })
        } else {

            // data adding to cart
            const Product = await product.findOne({ _id: req.body.productId })
            const userid = req.session.user_id

            const userData = await User.findOne({ _id: userid })

            const result = await User.updateOne({ _id: userData }, { $push: { cart: { productId: Product._id } } })

            if (result) {
                res.json({ status: true })
                res.redirect('/home')
                console.log('added to cart');
            } else {
                console.log('not addeed to cart');
            }


        }
    } catch (error) {
        console.log(error.message);
        console.log("add to cart");
    }
}

const deletecart = async (req, res) => {
    try {
        const ProductId = req.body.productId;
        const userId = req.session.user_id;

        const deletedata = await User.findOneAndUpdate({ _id: userId }, { $pull: { cart: { productId: ProductId } } })
        if (deletedata) {
            res.json({ success: true })
        }

    } catch (error) {
        console.log(error.message);
        console.log("deletecart");
    }
}


const change_Quantities = async (req, res) => {
    try {
        const { user, product, count, Quantity, proPrice } = req.body
        const producttemp = mongoose.Types.ObjectId(product)
        const usertemp = mongoose.Types.ObjectId(user)
        const updateQTY = await User.findOneAndUpdate({ _id: usertemp, 'cart.productId': producttemp }, { $inc: { 'cart.$.qty': count } })

        const currentqty = await User.findOne({ _id: usertemp, 'cart.productId': producttemp }, { _id: 0, 'cart.qty.$': 1 })

        const qty = currentqty.cart[0].qty

        const productSinglePrice = proPrice * qty
        await User.updateOne({ _id: usertemp, 'cart.productId': producttemp }, { $set: { 'cart.$.productTotalPrice': productSinglePrice } })
        const cart = await User.findOne({ _id: usertemp })
        let sum = 0
        for (let i = 0; i < cart.cart.length; i++) {
            sum = sum + cart.cart[i].productTotalPrice
        }

        const update = await User.updateOne({ _id: usertemp }, { $set: { cartTotalPrice: sum } })
            .then(async (response) => {
                res.json({ response: true, productSinglePrice, sum })
            })



    } catch (error) {
        console.log(error.message);
    }
}


// choutout 
const checkoutAddress = async (req, res) => {
    try {

        const userId = req.session.user_id

        const userData = await User.findOne({ _id: userId }).populate('cart.productId').exec()
        const address = await Address.findOne({ userId: userId })
        res.render('checkout', { userData, address })


    } catch (error) {
        console.log(error.message);
        console.log('checkout address');
    }
}

const insertAddress = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            let AddressObj = {
                fullname: req.body.fullname,
                mobileNumber: req.body.number,
                pincode: req.body.pincode,
                houseAddress: req.body.houseAddress,
                streetAddress: req.body.streetAdress,
                landMark: req.body.landmark,
                cityName: req.body.city,
                state: req.body.state
            }
            const userAddress = await Address.findOne({ userId: userId })
            if (userAddress) {
                console.log("addred to exist address");
                const userAdrs = await Address.findOne({ userId: userId }).populate('userId').exec()
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs.save().then((resp) => {
                    res.redirect('/userProfile')
                }).catch((err) => {
                    res.send(err)

                })

            } else {
                console.log("added to new address ");
                let userAddressObj = {
                    userId: userId,
                    userAddresses: [AddressObj]
                }
                await Address.create(userAddressObj).then((resp) => {
                    res.redirect('/userProfile')
                })
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}

const addCheckoutAddress = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id
            let AddressObj = {
                fullname: req.body.fullname,
                mobileNumber: req.body.number,
                pincode: req.body.pincode,
                houseAddress: req.body.houseAddress,
                streetAddress: req.body.streetAdress,
                landMark: req.body.landmark,
                cityName: req.body.city,
                state: req.body.state
            }
            const userAddress = await Address.findOne({ userId: userId })
            if (userAddress) {
                console.log("addred to exist address");
                const userAdrs = await Address.findOne({ userId: userId }).populate('userId').exec()
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs.save().then((resp) => {
                    res.redirect('/checkoutAddress')
                }).catch((err) => {
                    res.send(err)

                })

            } else {
                console.log("added to new address ");
                let userAddressObj = {
                    userId: userId,
                    userAddresses: [AddressObj]
                }
                await Address.create(userAddressObj).then((resp) => {
                    res.redirect('/checkoutAddress')
                })
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}

// const loadplaced  = async(req,res)=>{
//     try {
//         res.render('orderPlaced')

//     } catch (error) {
//         console.log(error.message);
//         console.log('loadplaced');
//     }
// }


const placeOrder = async (req, res) => {
    try {
        // console.log("get place order");
        const index = req.body.address

        const userId = req.session.user_id;

        const discount = req.body.couponDiscount
        const totel = req.body.total1
        const Coupon = req.body.couponC
        const couponUpdate = await coupon.updateOne({ couponCode: Coupon }, { $push: { used: userId } })

        const address = await Address.findOne({ userId: userId })
        const userAddress = address.userAddresses[index]
        // console.log(userAddress);
        const cartData = await User.findOne({ _id: userId }).populate('cart.productId')
        const total = cartData.cartTotalPrice
        const payment = req.body.payment
        let status = payment === 'COD' ? 'placed' : 'pending'
        let orderObj = {
            userId: userId,
            address: {
                fullName: userAddress.fullname,
                mobileNumber: userAddress.mobileNumber,
                pincode: userAddress.pincode,
                houseAddress: userAddress.houseAddress,
                streetAddress: userAddress.streetAddress,
                landMark: userAddress.landMark,
                cityName: userAddress.cityName,
                state: userAddress.state
            },
            paymentMethod: payment,
            orderStatus: status,
            items: cartData.cart,
            totalAmount: total,
            discount: discount
        }
        await Order.create(orderObj)
            .then(async (data) => {
            const orderId = data._id.toString()
                if (payment == 'COD') {
                    await User.updateOne({ _id: userId }, { $set: { cart: [], cartTotalPrice: 0 } })
                    console.log(data);
                    res.json({ status: true })
                } else {
                    var instance = new Razorpay({
                        key_id: process.env.KEY_ID,
                        key_secret: process.env.KEY_SECRET,
                    })
                    let amount = total
                    instance.orders.create({
                        amount: amount * 100,
                        currency: "INR",
                        receipt: orderId,
                    }, (err, order) => {
                        console.log(order);
                        res.json({ status: false, order })
                    })
                }
            })


    } catch (error) {
        console.log(error.message);

    }
}




const verifyPayment = async (req, res) => {
    try {
        console.log("inside verifypayment ");
        console.log(req.body);
        const userId = req.session.user_id
        const details = req.body
        console.log(details.payment);
        let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex')

        const orderId = details.order.receipt
        console.log(orderId);
        if (hmac == details.payment.razorpay_signature) {

            console.log('order Successfull')
            await User.updateOne({ _id: userId }, { $set: { cart: [], cartTotalPrice: 0 } })
            await Order.findByIdAndUpdate(orderId, { $set: { orderStatus: 'placed' } }).then((data) => {
                res.json({ status: true, data })
            }).catch((err) => {
                console.log(err);
                res.data({ status: false, err })
            })

        } else {
            res.json({ status: false })
            console.log('payment failed');
        }

    } catch (error) {
        console.log(error.message);
    }
}


const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.user_id
        console.log(userId);
        const userData = await User.findOne({ _id: userId })
        const catrData = await User.findOne({ _id: userId })
        const orderData = await Order.findOne({ userId: userId }).populate({ path: 'items', populate: { path: 'productId', model: 'product' } }).sort({ createdAt: -1 }).limit(1)
        res.render('orderConfirmation', { orderData })

    } catch (error) {
        console.log(error.message);
    }
}


const orderhistory = async (req, res) => {
    try {

        const id = req.session.user_id
        const orders = await Order.find({ userId: id }).populate({ path: 'items', populate: { path: 'productId', model: 'product' } })
        res.render('orderHistory', { orders })


    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrder = async (req, res) => {
    try {

        const id = req.query.id;
        console.log(id);
        const order = await Order.findById({ _id: id })
        console.log(order);
        order.orderStatus = "cancelled"
        order.save()
        res.redirect('/orderhistory')


    } catch (error) {
        console.log(error.message);
        console.log("cancelOrder");
    }
}


const loadaddress = async (req, res) => {


    try {
        // const userData = await User.findOne({_id:req.session.user_id})
        const address = await Address.findOne({ userId: req.session.user_id })


        res.render('addresses', { address })
    } catch (error) {
        console.log(error.message);
        console.log('error from showaddress');

    }

}


const editAddress = async (req, res) => {
    try {

        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const address = mongoose.Types.ObjectId(adrsSchemaId)
        const addresses = mongoose.Types.ObjectId(adrsId)

        const addressData = await Address.findOne({ address })

        const addressIndex = await addressData.userAddresses.findIndex(data => data.id == addresses)

        const editAddress = addressData.userAddresses[addressIndex]


        res.render('editAddress', { editAddress, addressIndex })


    } catch (error) {
        console.log(error.message);
        console.log(editAddress);
    }
}


const editandupdateaddress = async (req, res) => {
    try {

        const addressIndex = req.params.addressIndex
        console.log(addressIndex);
        const editData = { ...req.body }
        console.log(editData, "editDataa");
        const userId = req.session.user_id
        console.log(userId, "id")
        const updateAdrs = await Address.findOne({ userId })
        console.log(updateAdrs, "addressjhjh")
        updateAdrs.userAddresses[addressIndex] = { ...editData }

        await updateAdrs.save()
        res.redirect('/address')


    } catch (error) {
        console.log(error.message);
    }
}


const DeleteAddress = async (req, res) => {

    try {

        const adrSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const addressId = mongoose.Types.ObjectId(adrSchemaId)
        const addresses = mongoose.Types.ObjectId(adrsId)
        console.log(addresses)
        const addressData = await Address.findOne({ addressId })

        const addressIndex = await addressData.userAddresses.findIndex(data => data.id == addresses)

        addressData.userAddresses.splice(addressIndex, 1)

        const deleted = await addressData.save()
        res.redirect('/address')

    } catch (error) {
        console.log(error.message);
    }
}



// coupon apply 
const couponApply = async (req, res) => {

    try {

        const user = await User.findOne({ _id: req.session.user_id })

        let cartTotal = user.cartTotalPrice
        console.log(cartTotal);
        // inserting userid into coupon 
        const exist = await coupon.findOne({

            couponCode: req.body.code,

            used: { $in: [user._id] }
        })

        if (exist) {
            console.log(exist);
            res.json({ user: true })
        } else {

            const couponData = await coupon.findOne({ couponCode: req.body.code })
            if (couponData) {
                if (couponData.expiryDate >= new Date()) {
                    if (couponData.limit !== 0) {
                        if (couponData.minCartAmount <= cartTotal) {
                            if (couponData.couponAmountType === "fixed") {
                                let discountValue = couponData.couponAmount
                                let value = Math.round(cartTotal - couponData.couponAmount)
                                return res.json({
                                    amountokey: true,
                                    value,
                                    discountValue,
                                    code: req.body.code
                                })
                            } else if (couponData.couponAmountType === "percentage") {

                                const discountPercentage =
                                    (cartTotal * couponData.couponAmount) / 100
                                if (discountPercentage <= couponData.minRedeemAmound) {
                                    let discountValue = discountPercentage
                                    let value = Math.round(cartTotal - discountPercentage)
                                    return res.json({
                                        amountokey: true,
                                        value,
                                        discountValue,
                                        code: req.body.code,
                                    })
                                } else {

                                    let discountValue = couponData.minRedeemAmound
                                    let value = Math.round(cartTotal - couponData.minRedeemAmound)
                                    return res.json({
                                        amountokey: true,
                                        value,
                                        discountValue,
                                        code: req.body.code,
                                    })
                                }
                            }
                        } else {

                            res.json({ minimum: true })
                        }
                    } else {
                        res.json({ limit: true })
                    }
                } else {
                    res.json({ datefailed: true })
                }
            } else {
                res.json({ invalid: true })
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}






const productlist = async (req, res) => {
    try {

        const Product = await product.find({})
        res.render('fullProductList', { Product })

    } catch (error) {
        console.log(error.message);
    }
}

const wishToCart = async (req, res) => {
    try {

        const ProductId = req.body.productId;
        const userid = req.session.user_id
        const exist = await User.findOne({ id: userid, 'cart.productId': ProductId })

        if (exist) {
            console.log("item allready exist in Cart");
            res.json({ status: false })
        } else {

            // data adding to cart
            const Product = await product.findOne({ _id: req.body.productId })
            const userid = req.session.user_id

            const userData = await User.findOne({ _id: userid })

            const result = await User.updateOne({ _id: userData }, { $push: { cart: { productId: Product._id } } })
            if (result) {
                await User.findByIdAndUpdate({ _id: userid }, { $pull: { wishlist: { product: Product } } })
            }

            if (result) {
                res.json({ status: true })
                res.redirect('/home')
                console.log('added to cart');
            } else {
                console.log('not addeed to cart');
            }


        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    VerifyMail,
    sentOTP,
    verifyOTP,
    loginload,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetverify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerification,
    phoneCheck,
    productDetails,
    loadWishlist,
    addToWishlist,
    deleteWishlist,
    loaduserprofile,
    loadCart,
    AddToCart,
    deletecart,
    change_Quantities,
    checkoutAddress,
    insertAddress,
    addCheckoutAddress,
    placeOrder,
    orderSuccess,
    orderhistory,
    cancelOrder,
    loadaddress,
    editAddress,
    editandupdateaddress,
    DeleteAddress,
    couponApply,
    verifyPayment,
    productlist,
    wishToCart

}