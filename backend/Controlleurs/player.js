const InfoUser = require('../Modele/info_user');
//const jwt = require('jsonwebtoken');

exports.getPlayer = async (req, res) => {
  try {
    const search = req.query.query; // récupérer le paramètre de recherche
    const players = await InfoUser.find({ pseudo: { $regex: `^${search}`, $options: 'i' } }); // recherche de tous les joueurs dont le pseudo commence par la chaîne de recherche
    res.status(200).json(players); // envoi des joueurs trouvés au client
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProfilePlayer = async (req, res) => {
  const pseudo = req.params.pseudo;
  InfoUser.findOne({ pseudo:pseudo })
  .then(profile => {
      if (!profile) {
          return res.status(401).json({ message: "Profile non existant." });
      }
      res.status(200).json({
          pseudo: profile.pseudo,
          partiejoué: profile.partiejoué,
          partiegagné: profile.partiegagné,
          partieperdu: profile.partieperdu
      });
  })
  .catch(error => res.status(500).json({ error }));
};

exports.postProfilePlayer = async (req, res) => {
  const pseudo = req.body.pseudo;
  InfoUser.findOne({ pseudo:pseudo })
  .then(profile => {
      if (!profile) {
          return res.status(401).json({ message: "Profile non existant." });
      }
      res.status(200).json({
          pseudo: profile.pseudo,
          partiejoué: profile.partiejoué,
          partiegagné: profile.partiegagné,
          partieperdu: profile.partieperdu
      });
  })
  .catch(error => res.status(500).json({ error }));
};