var { default: mongoose } = require("mongoose");

var playerSchema = mongoose.Schema({
  userId: {type:String},
  pseudo: {type:String},
  email: {type:String},
  partiejoué: {type:Number},
  partiegagné: {type:Number},
  partieperdu: {type:Number}
});

module.exports=mongoose.model("infoUser", playerSchema);