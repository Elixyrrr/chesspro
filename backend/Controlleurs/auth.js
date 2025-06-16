const bcrypt = require('bcrypt');
const User = require('../Modele/user');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const InfoUser = require('../Modele/info_user');
dotenv.config();

exports.signup = (req, res, next) => {
  const emailEncrypted = CryptoJS.HmacSHA256(req.body.email, process.env.CRYPTOJS_CHIFFREMENT).toString();
  console.log(emailEncrypted);
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        pseudo: req.body.pseudo,
        email: emailEncrypted,
        password: hash
      });
      user.save()
        .then(() => {
          const infoUser = new InfoUser({
            userId: user._id,
            pseudo: user.pseudo,
            email: req.body.email,
            partiejoué: 0,
            partiegagné: 0,
            partieperdu: 0
          });
          infoUser.save()
            .then(() => {
              res.status(201).json({ message: 'Utilisateur créé !' });
            })
            .catch(error => res.status(400).json({ error: "Erreur lors de la création de l'info utilisateur." }));
        })
        .catch(error => {
          if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            res.status(409).json({ error: "Cette adresse email est déjà utilisée." });
          }else if (error.code === 11000 && error.keyPattern && error.keyPattern.pseudo === 1) {
            res.status(409).json({ error: "Un utilisateur avec ce pseudo existe déjà." });
          } else {
            res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
          }
        })
    })
    .catch(error => res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." }));
}
exports.login = (req, res, next) => {
  const emailEncrypted = CryptoJS.HmacSHA256(req.body.email, process.env.CRYPTOJS_CHIFFREMENT).toString();
  console.log(emailEncrypted);
  User.findOne({ pseudo: req.body.pseudo, email: emailEncrypted })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }

      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Le mot de passe est incorrect. Veuillez réessayer.' });
          }

          const token = jwt.sign(
            { userId: user._id },
            `${process.env.JWT_KEY_TOKEN}`,
            { expiresIn: '24h' }
          );
          res.cookie('token', token, { httpOnly: false, maxAge: 86400000 });

          res.status(200).json({
            message: "Authentification réussie!",
            userId: user._id,
            token: token
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.logout = (req, res, next) => {
  if (req.cookies && req.cookies.token) {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Déconnexion réussie.' });
  }
  return res.status(400).json({ message: 'Impossible de se déconnecter.' });
};