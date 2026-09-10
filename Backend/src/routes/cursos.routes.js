const express = require('express');
const router = express.Router();

const cursosController = require('../controllers/cursos.controller');

router.post('/cadastrar', cursosController.cadastrar);
router.get('/listar', cursosController.listar);
router.get('/buscar/:id', cursosController.buscar);
router.put('/atualizar/:id', cursosController.atualizar);
router.delete('/excluir/:id', cursosController.excluir);

module.exports = router;

