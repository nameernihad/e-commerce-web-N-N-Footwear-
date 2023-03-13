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
    wishlist: [{
        product:{
            type: mongoose.Types.ObjectId,
            ref: 'product',
            required:true
        
        }
      }],

    });

    module.exports = mongoose.model('User',userSchema);