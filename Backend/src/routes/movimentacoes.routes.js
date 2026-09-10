const express = require('express');
const router = express.Router();

const movimentacoesController = require('../controllers/movimentacoes.controller');

router.post('/cadastrar', movimentacoesController.cadastrar);
router.get('/listar', movimentacoesController.listar);
router.get('/buscar/:id', movimentacoesController.buscar);
router.put('/atualizar/:id', movimentacoesController.atualizar);
router.delete('/excluir/:id', movimentacoesController.excluir);

module.exports = router;