const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, `${process.env.JWT_KEY_TOKEN}`, (err, decoded) => {
      if (err) {
        // le token n'est pas valide, donc l'utilisateur n'est pas authentifié
        res.status(400).json(err)
      } else {
        // le token est valide, donc l'utilisateur est authentifié
        const userId = decoded.id;
        req.userId=userId;
        // poursuivez la logique de votre application ici
        next(); // n'oubliez pas d'appeler next() pour passer au middleware suivant
      }
    });
  } else {
    // le cookie n'existe pas, donc l'utilisateur n'est pas authentifié
    res.status(401).json({message : "Vous n'êtes pas authentifié"})
  }
};

