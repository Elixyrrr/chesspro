const Partie = require('../Modele/partie');
const InfoUser= require('../Modele/info_user');
const jwt=require('jsonwebtoken');

exports.save = async (req, res, next) => {
  const { nomjoueur1, nomjoueur2, resultat, pgn, userId } = req.body; // Sauvegarde le résultat envoyé par le client
  const nouvellePartie = new Partie({
    joueur1: nomjoueur1,
    joueur2: nomjoueur2,
    resultat,
    date: new Date(),
    pgn,
    userId
  });

  try {
    await nouvellePartie.save();

    // Mise à jour des statistiques du joueur
    InfoUser.findOne({ userId })
      .then((player) => {
        if (!player) {
          console.error('Joueur introuvable');
          return res.sendStatus(500);
        }

        player.partiejoué += 1;

        if (resultat === 'Gagnant') {
          player.partiegagné += 1;
        } else if (resultat === 'Perdant') {
          player.partieperdu += 1;
        } else if (resultat === 'Egalité') {
          // Incrémenter seulement le nombre de parties jouées en cas d'égalité
          return player.save();
        }

        return player.save();
      })
      .then((updatedPlayer) => {
        console.log('Statistiques mises à jour pour le joueur :', updatedPlayer);
        res.sendStatus(201);
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(500);
      });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

exports.getHistorique = (req, res, next) => {
  const token = req.cookies.token;
  const decodedToken = jwt.verify(token, process.env.JWT_KEY_TOKEN);
  const userId = decodedToken.userId;

  Partie.find({ userId })
    .then(parties => {
      if (!parties) {
        return res.status(401).json({ message: "Partie non trouvée" });
      }
      const partiesFormatees = parties.map(partie => {
        return {
          joueur1: partie.joueur1,
          joueur2: partie.joueur2,
          resultat: partie.resultat,
          date: partie.date,
          pgn: partie.pgn,
        };
      });
      res.status(200).json(partiesFormatees);
    })
    .catch(error => res.status(500).json({ error }));
};
