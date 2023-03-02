const mongoose= require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    discription:{
        type:String,
        required:true
    },
});

module.exports = mongoose.model('category',categorySchema);