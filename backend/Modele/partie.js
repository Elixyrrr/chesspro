var { default: mongoose } = require("mongoose");

var partieSchema = mongoose.Schema({
  joueur1:{ type: String, required: true },
  joueur2: { type: String, required: true },
  resultat: { type: String, required: true },
  date: { type: Date, required: true },
  pgn: { type: String, required: true },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Partie', partieSchema);