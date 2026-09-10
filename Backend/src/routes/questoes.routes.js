const express = require('express');
const router = express.Router();

const questoesController = require('../controllers/questoes.controller');

router.post('/cadastrar', questoesController.cadastrar);
router.get('/listar', questoesController.listar);
router.get('/buscar/:id', questoesController.buscar);
router.put('/atualizar/:id', questoesController.atualizar);
router.delete('/excluir/:id', questoesController.excluir);

module.exports = router;