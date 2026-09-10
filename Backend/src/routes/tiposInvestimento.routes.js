const express = require('express');
const router = express.Router();

const tiposInvestimentoController = require('../controllers/tiposInvestimento.controller');

router.post('/cadastrar', tiposInvestimentoController.cadastrar);
router.get('/listar', tiposInvestimentoController.listar);
router.get('/buscar/:id', tiposInvestimentoController.buscar);
router.put('/atualizar/:id', tiposInvestimentoController.atualizar);
router.delete('/excluir/:id', tiposInvestimentoController.excluir);

module.exports = router;