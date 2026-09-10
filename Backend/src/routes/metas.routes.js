const express = require('express');
const router = express.Router();

const metasController = require('../controllers/metas.controller');

router.post('/cadastrar', metasController.cadastrar);
router.get('/listar', metasController.listar);
router.get('/buscar/:id', metasController.buscar);
router.put('/atualizar/:id', metasController.atualizar);
router.delete('/excluir/:id', metasController.excluir);

module.exports = router;