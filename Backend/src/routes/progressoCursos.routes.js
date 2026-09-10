const express = require('express');
const router = express.Router();

const progressoCursosController = require('../controllers/progressoCursos.controller');

router.post('/cadastrar', progressoCursosController.cadastrar);
router.get('/listar', progressoCursosController.listar);
router.get('/buscar/:id', progressoCursosController.buscar);
router.put('/atualizar/:id', progressoCursosController.atualizar);
router.delete('/excluir/:id', progressoCursosController.excluir);

module.exports = router;

