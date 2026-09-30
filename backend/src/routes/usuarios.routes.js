const express = require('express');

const router = express.Router();

const controller = require('../controllers/usuarios.controller');

const autenticar = require('../middleware/autenticar');
const admin = require('../middleware/admin');

router.post('/cadastrar', controller.cadastrar);

router.post('/login', controller.login);

router.get('/listar', autenticar, admin, controller.listar);

router.get('/buscar/:id', autenticar, controller.buscar);

router.put('/atualizar/:id', autenticar, controller.atualizar);

router.delete('/excluir/:id', autenticar, controller.excluir);

module.exports = router;