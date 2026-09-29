const express = require('express');

const router = express.Router();

const controller = require('../controllers/assinaturas.controller');

const autenticar = require('../middleware/autenticar');

router.post('/cadastrar', autenticar, controller.cadastrar);
router.get('/listar', autenticar, controller.listar);
router.get('/buscar/:id', autenticar, controller.buscar);
router.put('/atualizar/:id', autenticar, controller.atualizar);
router.delete('/excluir/:id', autenticar, controller.excluir);

module.exports = router;