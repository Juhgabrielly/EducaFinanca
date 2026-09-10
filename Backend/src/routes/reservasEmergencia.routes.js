const express = require('express');
const router = express.Router();

const reservasEmergenciaController = require('../controllers/reservasEmergencia.controller');

router.post('/cadastrar', reservasEmergenciaController.cadastrar);
router.get('/listar', reservasEmergenciaController.listar);
router.get('/buscar/:id', reservasEmergenciaController.buscar);
router.put('/atualizar/:id', reservasEmergenciaController.atualizar);
router.delete('/excluir/:id', reservasEmergenciaController.excluir);

module.exports = router;