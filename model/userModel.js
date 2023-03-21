const mongoose= require("mongoose");


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    block:{
        type:Boolean,
        default:false
    },
    cart:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'product',
            required:true
        },
        price:{
            type:Number
        },
        qty:{
            type:Number,
            required:true,
            default:0
        },
        productTotalPrice:{
            type:Number,
            required:true
        }
    }],
    cartTotalPrice:{
        type:Number,
        default:0
    },
    wishlist: [{
        product:{
            type: mongoose.Types.ObjectId,
            ref: 'product',
            required:true
        
        }
      }],
    

    });

    module.exports = mongoose.model('User',userSchema);