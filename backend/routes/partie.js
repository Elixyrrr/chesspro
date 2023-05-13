const express = require('express');
const router = express.Router();
const partieCtrl = require('../Controlleurs/partiesave');
const auth = require('../Middlewares/auth');

router.post('/save',auth,partieCtrl.save);
router.get('/historique', auth ,partieCtrl.getHistorique);

module.exports = router;