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
    category:{
        type:String,
        required:true
    },
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
})
module.exports = mongoose.model('product',productSchema);