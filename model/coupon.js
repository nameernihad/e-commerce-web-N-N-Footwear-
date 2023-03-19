const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    couponAmountType:{
        type:String,
        required:true
    },
    couponAmount:{
        type:Number,
        required:true
    },
    minCartAmount:{
        type:Number,
        
    },
    minRedeemAmound:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date
    },
    limit:{
        type:Number,
        required:true
    },
    used:{
        type:Array
    },
    expiryDate:{
        type:Date
    },
    disabled:{
        type:Boolean,
        default:true
    }

},{timestamps:true})
module.exports = mongoose.model('coupon',couponSchema); 