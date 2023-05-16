const InfoUser=require('../Modele/info_user');
const User=require('../Modele/user');
const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');
const result=dotenv.config();
const CryptoJS=require('crypto-js');
const bcrypt=require('bcrypt');
//console.log(req.body);

exports.modifyProfile = async (req, res, next) => {
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_KEY_TOKEN);
  const userId = decodedToken.userId;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Mise à jour des informations de InfoUser
    const infoUser = await InfoUser.findOne({ userId });
    if (!infoUser) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Stocker l'ancien email et pseudo de l'utilisateur avant la mise à jour dans la collection User
    const oldEmail = infoUser.email;
    const oldPseudo = infoUser.pseudo;

    if (req.body.pseudo !== infoUser.pseudo) {
      // Vérifier si le pseudo est déjà utilisé
      const pseudoExists = await InfoUser.findOne({ pseudo: req.body.pseudo });
      if (pseudoExists) {
        return res
          .status(400)
          .json({ message: "Le pseudo est déjà utilisé." });
      }
      await InfoUser.updateOne({ userId }, { pseudo: req.body.pseudo });
      await User.updateOne({ _id: userId }, { pseudo: req.body.pseudo });
    }

    if (req.body.email && req.body.email !== infoUser.email) {
      // Vérifier si l'adresse e-mail est déjà utilisée
      const emailExists = await InfoUser.findOne({ email: req.body.email });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "L'adresse e-mail est déjà utilisée." });
      }
      const hashedEmail = CryptoJS.HmacSHA256(req.body.email, process.env.CRYPTOJS_CHIFFREMENT).toString();
      await User.updateOne({ _id: userId }, { email: hashedEmail });
      await InfoUser.updateOne({ userId }, { email: req.body.email });
    }

    // Vérifier si le pseudo et l'email ont été modifiés
    if (
      (req.body.pseudo && req.body.pseudo !== oldPseudo) ||
      (req.body.email && req.body.email !== oldEmail)
    ) {
      // Renvoyer une réponse de réussite avec le nouvel email et pseudo
      const response = {
        message: "Le profil a été mis à jour avec succès.",
        email: req.body.email || oldEmail,
        pseudo: req.body.pseudo || oldPseudo,
      };
      res.status(200).json(response);
    } else if (req.body.password) {
      // Cryptage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(req.body.password, 11);
      await User.updateOne({ _id: userId }, { password: hashedPassword });

      res.status(200).json({ message: "Le mot de passe a été modifié." });
    } else {
      // Si aucune modification n'a été apportée, renvoyer un message d'erreur
      res.status(400).json({ message: "Aucune modification détectée." });
    }
  } catch (error) {
    // Si une erreur se produit, renvoyer une réponse d'erreur avec le message d'erreur
    res.status(500).json({ error });
  }
}





exports.deleteProfile = (req, res, next) => {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY_TOKEN);
    const userId = decodedToken.userId;
  
    User.findOneAndDelete({ _id: userId })
      .then(() => {
        InfoUser.findOneAndDelete({ userId: userId })
          .then(() => {
            res.clearCookie('token');
            res.status(200).json({ message: 'Compte utilisateur supprimé.' });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };


exports.getProfile = (req, res, next) => {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY_TOKEN);
    const userId = decodedToken.userId;
    
    InfoUser.findOne({ userId })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé." });
        }
        res.status(200).json({
            userId: userId,
            email: user.email,
            pseudo: user.pseudo,
            partiejoué: user.partiejoué,
            partiegagné: user.partiegagné,
            partieperdu: user.partieperdu
        });
    })
      .catch(error => res.status(500).json({ error }));
  };