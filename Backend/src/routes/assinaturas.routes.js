const express = require('express');
const router = express.Router();

const assinaturasController = require('../controllers/assinaturas.controller');

router.post('/cadastrar', assinaturasController.cadastrar);
router.get('/listar', assinaturasController.listar);
router.get('/buscar/:id', assinaturasController.buscar);
router.put('/atualizar/:id', assinaturasController.atualizar);
router.delete('/excluir/:id', assinaturasController.excluir);

module.exports = router;