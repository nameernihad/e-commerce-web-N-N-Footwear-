const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        enum:['percentage','flat'],
    },
    discountAmount:{
        type:String
    },
    maxDiscountAmount:{
        type:String,
        required:true
    },
    minDiscountAmound:{
        type:String,
        required:true,
       
    },
    minPurchase:{
        type:String,
        required:true
    },
    creaetDate:{
        type:String
    },
    expiryDate:{
        type:String
    }

})
module.exports = mongoose.model('coupon',couponSchema); 