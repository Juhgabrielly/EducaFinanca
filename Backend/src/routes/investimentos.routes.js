const express = require('express');
const router = express.Router();

const investimentosController = require('../controllers/investimentos.controller');

router.post('/cadastrar', investimentosController.cadastrar);
router.get('/listar', investimentosController.listar);
router.get('/buscar/:id', investimentosController.buscar);
router.put('/atualizar/:id', investimentosController.atualizar);
router.delete('/excluir/:id', investimentosController.excluir);

module.exports = router;