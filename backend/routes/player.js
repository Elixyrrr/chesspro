const express = require('express');
const router = express.Router();
const searchCtrl=require('../Controlleurs/player');
const auth = require('../Middlewares/auth');

router.get('/search/:pseudo', searchCtrl.getProfilePlayer);
router.post('/search/:pseudo', searchCtrl.getProfilePlayer);
router.get('/search', searchCtrl.getPlayer);


module.exports = router; 