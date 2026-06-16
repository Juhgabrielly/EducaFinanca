require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const resultadoquizRoutes = require('./src/routes/resultadoquiz.routes');

app.use('/resultadoquiz', resultadoquizRoutes);


const alternativaRoutes = require('./src/routes/alternativa.routes');

app.use('/alternativa', alternativaRoutes);


const perguntaRoutes = require('./src/routes/pergunta.routes');

app.use('/pergunta', perguntaRoutes);


const quizRoutes = require('./src/routes/quiz.routes');

app.use('/quiz', quizRoutes);


const progressocursoRoutes = require('./src/routes/progressocurso.routes');

app.use('/progressocurso', progressocursoRoutes);


const cursoRoutes = require('./src/routes/curso.routes');

app.use('/curso', cursoRoutes);


const materiaRoutes = require('./src/routes/materia.routes');

app.use('/materia', materiaRoutes);


const historicofinanceiroRoutes = require('./src/routes/historicofinanceiro.routes');

app.use('/historicofinanceiro', historicofinanceiroRoutes);


const relatorioRoutes = require('./src/routes/relatorio.routes');

app.use('/relatorio', relatorioRoutes);


const investimentoRoutes = require('./src/routes/investimento.routes');

app.use('/investimento', investimentoRoutes);


const dashboardfinanceiroRoutes = require('./src/routes/dashboardfinanceiro.routes');

app.use('/dashboardfinanceiro', dashboardfinanceiroRoutes);


const metaRoutes = require('./src/routes/meta.routes');

app.use('/meta', metaRoutes);


const usuariosRoutes = require('./src/routes/usuarios.routes');

app.use('/usuarios', usuariosRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
