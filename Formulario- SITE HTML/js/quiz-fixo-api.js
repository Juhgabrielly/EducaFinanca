
document.addEventListener('DOMContentLoaded', () => {
    const correspondencia = window.location.pathname.match(/quiz(\d+)\.html$/i);
    const numero = correspondencia ? Number(correspondencia[1]) : 0;

    if (!numero || typeof obterToken !== 'function' || !obterToken()) {
        return;
    }

    const botao = document.getElementById('concluirQuiz');

    if (!botao) {
        return;
    }

    let enviando = false;
    let salvo = false;

    botao.addEventListener('click', async evento => {
        evento.preventDefault();
        evento.stopImmediatePropagation();

        if (salvo) {
            window.location.href = `curso${numero}.html`;
            return;
        }

        if (enviando) {
            return;
        }

        enviando = true;
        botao.disabled = true;

        try {
            const perguntasPagina = Array.from(
                document.querySelectorAll('.questao')
            );

            const respostasPagina = perguntasPagina.map(item => {
                const escolhida = item.querySelector(
                    '.opcao.errou, .opcao.acertou'
                );

                const pergunta = item.querySelector('.pergunta');

                return {
                    pergunta: limparPergunta(pergunta?.textContent || ''),
                    resposta: escolhida
                        ? escolhida.textContent.trim().replace(/[✓✕]/g, '').trim()
                        : ''
                };
            });

            if (respostasPagina.some(item => !item.resposta)) {
                throw new Error('Responda a todas as perguntas antes de concluir.');
            }

            const [cursos, quizzes] = await Promise.all([
                EducaAPI.get('/cursos/listar'),
                EducaAPI.get('/quizzes/listar')
            ]);

            const nomes = {
                1: 'Planejamento e Organização Financeira',
                2: 'Gestão de Dívidas e Créditos',
                3: 'Investimento',
                4: 'Matemática Financeira',
                5: 'Educação Financeira Empresarial',
                6: 'Psicologia Econômica'
            };

            const curso = (cursos || []).find(item =>
                normalizarQuiz(item.titulo) ===
                normalizarQuiz(nomes[numero]) &&
                (numero !== 4 || Number(item.id) === 3)
            );

            if (!curso) {
                throw new Error('Curso não encontrado no backend.');
            }

            // O quiz de Matemática Financeira está cadastrado com ID 7.
            const idQuiz = numero === 4
                ? 7
                : Number(
                    (quizzes || []).find(item =>
                        Number(item.curso_id) === Number(curso.id)
                    )?.id
                );

            const quiz = (quizzes || []).find(item =>
                Number(item.id) === idQuiz &&
                Number(item.curso_id) === Number(curso.id)
            );

            if (!quiz) {
                throw new Error('Quiz não encontrado para o curso selecionado.');
            }

            const questoesBanco = await EducaAPI.get(
                `/questoes/quiz/${quiz.id}`
            );

            const respostas = [];

            for (const item of respostasPagina) {
                const questao = (questoesBanco || []).find(registro =>
                    normalizarQuiz(registro.pergunta) ===
                    normalizarQuiz(item.pergunta)
                );

                if (!questao) {
                    throw new Error(
                        `Questão não encontrada no banco: ${item.pergunta}`
                    );
                }

                respostas.push({
                    questao_id: questao.id,
                    resposta: item.resposta
                });
            }

            const resultado = await EducaAPI.post(
                '/resultadosQuiz/cadastrar',
                {
                    quiz_id: quiz.id,
                    respostas
                }
            );

            const mensagem = document.getElementById('mensagem');

            const textoResultado =
                `Resultado salvo: ${resultado.acertos}/${resultado.total} ` +
                `acertos (${resultado.pontuacao}%).`;

            if (mensagem) {
                mensagem.textContent = textoResultado;
            }

            let aviso = document.getElementById('avisoResultadoBackend');

            if (!aviso) {
                aviso = document.createElement('p');
                aviso.id = 'avisoResultadoBackend';
                aviso.style.cssText =
                    'padding:12px;background:#e8f5e9;border-radius:8px;margin-top:12px';
                botao.insertAdjacentElement('afterend', aviso);
            }

            aviso.textContent =
                `Resultado registrado na sua conta: ${textoResultado}`;

            await EducaAPI.post('/progressoCursos/cadastrar', {
                curso_id: curso.id,
                progresso: 100,
                concluido: true
            });

            localStorage.setItem(`quiz${numero}Concluido`, 'true');

            botao.textContent = 'Voltar ao curso';
            botao.disabled = false;
            salvo = true;

        } catch (erro) {
            const mensagem = document.getElementById('mensagem');

            if (mensagem) {
                mensagem.textContent =
                    `Não foi possível salvar no backend: ${erro.message}`;
            }

            botao.disabled = false;
        } finally {
            enviando = false;
        }
    }, true);
});

function limparPergunta(valor) {
    return String(valor || '')
        .replace(/^\s*\d+\.\s*/, '')
        .trim();
}

function normalizarQuiz(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/^\s*\d+\.\s*/, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}
