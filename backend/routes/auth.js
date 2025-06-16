//Importation de Express
const express = require('express');
const auth = require('../Middlewares/auth');
//Fonction Router
const router = express.Router();
const authCtrl=require('../Controlleurs/auth');
const password=require('../Middlewares/password');

//Route d'authentification
router.post('/signup', password,  authCtrl.signup);
router.post('/login',  authCtrl.login);
router.post('/logout', auth, authCtrl.logout);

//Exportation du routeur
module.exports = router;