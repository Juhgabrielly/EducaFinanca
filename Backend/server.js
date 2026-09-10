const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const usuariosRoutes = require('./src/routes/usuarios.routes');
const assinaturasRoutes = require('./src/routes/assinaturas.routes');
const cursosRoutes = require('./src/routes/cursos.routes');
const progressoCursosRoutes = require('./src/routes/progressoCursos.routes');
const quizzesRoutes = require('./src/routes/quizzes.routes');
const questoesRoutes = require('./src/routes/questoes.routes');
const resultadosQuizRoutes = require('./src/routes/resultadosQuiz.routes');
const metasRoutes = require('./src/routes/metas.routes');
const tiposInvestimentoRoutes = require('./src/routes/tiposInvestimento.routes');
const investimentosRoutes = require('./src/routes/investimentos.routes');
const reservasEmergenciaRoutes = require('./src/routes/reservasEmergencia.routes');
const movimentacoesRoutes = require('./src/routes/movimentacoes.routes');

app.use('/usuarios', usuariosRoutes);
app.use('/assinaturas', assinaturasRoutes);
app.use('/cursos', cursosRoutes);
app.use('/progressoCursos', progressoCursosRoutes);
app.use('/quizzes', quizzesRoutes);
app.use('/questoes', questoesRoutes);
app.use('/resultadosQuiz', resultadosQuizRoutes);
app.use('/metas', metasRoutes);
app.use('/tiposInvestimento', tiposInvestimentoRoutes);
app.use('/investimentos', investimentosRoutes);
app.use('/reservasEmergencia', reservasEmergenciaRoutes);
app.use('/movimentacoes', movimentacoesRoutes);

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API EducaFinança funcionando!'
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

