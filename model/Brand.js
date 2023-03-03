const mongoose= require("mongoose");

const BrandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
});

module.exports = mongoose.model('brand',BrandSchema);