var { default: mongoose } = require("mongoose");
var userSchema = mongoose.Schema({
  pseudo: {type:String, index: { unique: true }},
  email: {type:String, required:true, index: { unique: true }},
  password: {type:String, required:true}
});


module.exports=mongoose.model("User", userSchema);
