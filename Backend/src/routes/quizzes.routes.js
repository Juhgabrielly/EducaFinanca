const express = require('express');
const router = express.Router();

const quizzesController = require('../controllers/quizzes.controller');

router.post('/cadastrar', quizzesController.cadastrar);
router.get('/listar', quizzesController.listar);
router.get('/buscar/:id', quizzesController.buscar);
router.put('/atualizar/:id', quizzesController.atualizar);
router.delete('/excluir/:id', quizzesController.excluir);

module.exports = router;