const mongoose= require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    Image:{
        type:Array,
        required:true
    },
    category:[{
        type: String,
        ref:'category',
        required:true
    }],
   brand:{
        type:String,
        required:true
    },
   quantity:{
        type:Number,
        required:true
    },
//    uploadedDate:{
//         type:Date,
//         required:true
//     },
   discription:{
        type:String,
        required:true
    },
    list:{
        type:Boolean,
        require:true,
        default:true,
    },
    createdAt:{
        type:Date
    },
    offerPrice:{
        type:Number,
        require:true,
        default:0
    },
    offer:{
        offerStatus:{
            type:Boolean,
            require:true,
            default:false
        },
        offerPercentage:{
            type:Number,
            require:true,
            default:0
        }
    }
})
module.exports = mongoose.model('product',productSchema);