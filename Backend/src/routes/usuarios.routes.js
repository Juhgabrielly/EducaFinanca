const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuarios.controller');

router.post('/cadastrar', usuariosController.cadastrar);
router.get('/listar', usuariosController.listar);
router.get('/buscar/:id', usuariosController.buscar);
router.put('/atualizar/:id', usuariosController.atualizar);
router.delete('/excluir/:id', usuariosController.excluir);

module.exports = router;