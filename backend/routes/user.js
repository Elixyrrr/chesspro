const express = require('express');
const router = express.Router();
const stuffCtrl=require('../Controlleurs/user');
const auth = require('../Middlewares/auth');

// Routeur du profil

router.put('/profile', auth, stuffCtrl.modifyProfile);  //modifier un objet de la base de données
  
router.delete('/profile', auth, stuffCtrl.deleteProfile); //suppression d'un objet de la base de données*/

router.get('/profile', auth, stuffCtrl.getProfile);

module.exports = router; 