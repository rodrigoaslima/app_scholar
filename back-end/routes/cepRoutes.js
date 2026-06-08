const { Router } = require('express');

const { getAddressByCep } = require('../controllers/cepController');

const router = Router();

router.get('/cep/:cep', getAddressByCep);

module.exports = router;
