const express = require('express');
const router = express.Router();

const resultadosQuizController = require('../controllers/resultadosQuiz.controller');

router.post('/cadastrar', resultadosQuizController.cadastrar);
router.get('/listar', resultadosQuizController.listar);
router.get('/buscar/:id', resultadosQuizController.buscar);
router.put('/atualizar/:id', resultadosQuizController.atualizar);
router.delete('/excluir/:id', resultadosQuizController.excluir);

module.exports = router;