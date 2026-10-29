
const API_URL = 'http://localhost:3000';

async function carregarCurso() {
    const parametros = new URLSearchParams(window.location.search);
    const cursoId = parametros.get('id');

    if (!cursoId) {
        document.getElementById('nomeCurso').textContent =
            'Curso não informado.';
        return;
    }

    try {
        const [respostaCursos, respostaQuizzes] = await Promise.all([
            fetch(`${API_URL}/cursos/listar`),
            fetch(`${API_URL}/quizzes/listar`)
        ]);

        if (!respostaCursos.ok || !respostaQuizzes.ok) {
            throw new Error('Erro ao consultar a API.');
        }

        const dadosCursos = await respostaCursos.json();
        const dadosQuizzes = await respostaQuizzes.json();

        const cursos = Array.isArray(dadosCursos)
            ? dadosCursos
            : dadosCursos.cursos || dadosCursos.dados || [];

        const quizzes = Array.isArray(dadosQuizzes)
            ? dadosQuizzes
            : dadosQuizzes.quizzes || dadosQuizzes.dados || [];

        const curso = cursos.find(
            item => String(item.id) === String(cursoId)
        );

        if (!curso) {
            document.getElementById('nomeCurso').textContent =
                'Curso não encontrado.';
            return;
        }

        document.getElementById('nomeCurso').textContent =
            curso.nome || curso.titulo || curso.nomeCurso || 'Curso';

        document.getElementById('descricaoCurso').textContent =
            curso.descricao || '';

        document.getElementById('conteudoCurso').textContent =
            curso.conteudo || curso.material || 'Conteúdo em preparação.';

        const lista = document.getElementById('listaQuizzes');
        lista.innerHTML = '';

        const quizzesDoCurso = quizzes.filter(
            quiz => String(quiz.curso_id ?? quiz.cursoId) === String(cursoId)
        );

        if (quizzesDoCurso.length === 0) {
            lista.textContent = 'Nenhum quiz cadastrado para este curso.';
            return;
        }

        quizzesDoCurso.forEach(quiz => {
            const card = document.createElement('article');
            const titulo = document.createElement('h3');
            const botao = document.createElement('button');

            titulo.textContent =
                quiz.titulo || quiz.nome || quiz.nomeQuiz || 'Quiz';

            botao.textContent = 'Fazer quiz';

            botao.addEventListener('click', () => {
                window.location.href =
                    `quiz.html?id=${encodeURIComponent(quiz.id)}`;
            });

            card.append(titulo, botao);
            lista.appendChild(card);
        });
    } catch (erro) {
        console.error(erro);
        document.getElementById('nomeCurso').textContent =
            'Não foi possível carregar o curso.';
    }
}

document.addEventListener('DOMContentLoaded', carregarCurso);
