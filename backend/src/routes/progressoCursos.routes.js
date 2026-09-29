const express = require('express');

const router = express.Router();

const controller = require('../controllers/progressoCursos.controller');

const autenticar = require('../middleware/autenticar');
const admin = require('../middleware/admin');

router.post('/cadastrar', autenticar, admin, controller.cadastrar);
router.get('/listar', autenticar, controller.listar);
router.get('/buscar/:id', autenticar, controller.buscar);
router.put('/atualizar/:id', autenticar, admin, controller.atualizar);
router.delete('/excluir/:id', autenticar, admin, controller.excluir);

module.exports = router;