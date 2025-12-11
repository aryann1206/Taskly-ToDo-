let mongoose = require("mongoose");

try {
    mongoose.connect("");
}
catch (e) {
    res.status(5000).json({
        message:"internet error",
        error:e
    });
    return;
}


let userSchema = new mongoose.Schema({
    username:{type:String},
    password:{type:String},
    email:{type:String,unique:true}
})


const todoSchema = new mongoose.Schema({
    title: String,
    completed:Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "todousers", required: true }
});

const todoModel = mongoose.model("Todo", todoSchema);
let userModel = mongoose.model("todousers",userSchema);


module.exports={
    userModel,todoModel
}