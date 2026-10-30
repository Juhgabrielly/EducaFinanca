document.addEventListener('DOMContentLoaded', async () => {
    const correspondencia = location.pathname.match(/curso(\d+)\.html/i);
    const numero = Number(correspondencia?.[1]);

    const titulos = {
        1: 'Planejamento e Organização Financeira',
        2: 'Gestão de Dívidas e Créditos',
        3: 'Investimento',
        4: 'Matemática Financeira',
        5: 'Educação Financeira Empresarial',
        6: 'Psicologia Econômica'
    };

    const titulosQuiz = {
        1: 'Quiz de Planejamento e Organização Financeira',
        2: 'Quiz de Gestão de Dívidas e Crédito',
        3: 'Quiz sobre Investimentos',
        4: 'Quiz de Matemática Financeira',
        5: 'Quiz de Educação Financeira Empresarial',
        6: 'Quiz sobre Psicologia Econômica'
    };

    if (!numero || !obterToken()) return;

    const tituloCurso = titulos[numero];

    if (!tituloCurso) return;

    try {
        const [
            cursos,
            quizzes,
            progressos,
            resultados
        ] = await Promise.all([
            EducaAPI.get('/cursos/listar'),
            EducaAPI.get('/quizzes/listar'),
            EducaAPI.get('/progressoCursos/listar'),
            EducaAPI.get('/resultadosQuiz/listar')
        ]);

        const curso = (cursos || []).find(item =>
            normalizarCurso(item.titulo) === normalizarCurso(tituloCurso)
        );

        if (!curso) {
            mostrarAviso(
                'Este curso ainda não foi cadastrado no banco. ' +
                'No backend, execute: npm run seed:cursos'
            );
            return;
        }

        const quizzesDoCurso = (quizzes || []).filter(item =>
            Number(item.curso_id) === Number(curso.id)
        );

        const quizOriginal = quizzesDoCurso.find(item =>
            normalizarCurso(item.titulo) ===
            normalizarCurso(titulosQuiz[numero])
        ) || quizzesDoCurso[0];

        const progressoSalvo = (progressos || []).find(item =>
            Number(item.curso_id) === Number(curso.id)
        );

        let porcentagem = Math.max(
            0,
            Math.min(100, Number(progressoSalvo?.progresso || 0))
        );

        criarPainelProgresso(porcentagem);

        const aviso = mensagem => {
            const elemento = document.getElementById('progressoCursoAviso');

            if (elemento) {
                elemento.textContent = mensagem;
            }
        };

        async function salvarProgresso(valor, concluido = false) {
            const resposta = await EducaAPI.post(
                '/progressoCursos/cadastrar',
                {
                    curso_id: curso.id,
                    progresso: valor,
                    concluido
                }
            );

            porcentagem = Math.max(
                0,
                Math.min(100, Number(resposta.progresso ?? valor))
            );

            const texto = document.getElementById('progressoCursoTexto');
            const barra = document.getElementById('progressoCursoBarra');

            if (texto) {
                texto.textContent = `${porcentagem}% concluído`;
            }

            if (barra) {
                barra.style.width = `${porcentagem}%`;
            }
        }

        if (porcentagem < 10) {
            await salvarProgresso(10, false);
        }

        document
            .getElementById('registrarEstudoAPI')
            ?.addEventListener('click', async evento => {
                const botao = evento.currentTarget;
                botao.disabled = true;

                try {
                    await salvarProgresso(
                        Math.max(50, porcentagem),
                        false
                    );
                } catch (erro) {
                    aviso(`Não foi possível salvar o estudo: ${erro.message}`);
                } finally {
                    botao.disabled = false;
                }
            });

        if (quizOriginal) {
            const resultadoFeito = (resultados || []).some(item =>
                Number(item.quiz_id) === Number(quizOriginal.id) &&
                Number(item.pontuacao) >= 0
            );

            const botaoConcluir = document.getElementById('concluirCurso');

            if (botaoConcluir) {
                botaoConcluir.disabled = !resultadoFeito;

                botaoConcluir.textContent = resultadoFeito
                    ? '✓ Concluir curso'
                    : '🔒 Complete o quiz para concluir';

                botaoConcluir.addEventListener(
                    'click',
                    async evento => {
                        evento.preventDefault();

                        if (!resultadoFeito) {
                            aviso(
                                'Conclua o quiz para registrar o curso como finalizado.'
                            );
                            return;
                        }

                        botaoConcluir.disabled = true;

                        try {
                            await salvarProgresso(100, true);
                            location.href = 'cursos.html';
                        } catch (erro) {
                            aviso(
                                `Não foi possível salvar o progresso: ${erro.message}`
                            );

                            botaoConcluir.disabled = false;
                        }
                    },
                    true
                );
            }
        }

    } catch (erro) {
        mostrarAviso(
            'O conteúdo do curso continua disponível, mas a sincronização ' +
            `falhou: ${erro.message}`
        );
    }
});


function criarPainelProgresso(porcentagem) {
    const painel = document.createElement('section');
    painel.className = 'content-card';

    painel.innerHTML = `
        <p id="progressoCursoTexto">
            ${porcentagem}% concluído
        </p>

        <div style="
            height: 10px;
            background: #e7e7e7;
            border-radius: 8px;
            overflow: hidden;
        ">
            <div
                id="progressoCursoBarra"
                style="
                    height: 100%;
                    width: ${porcentagem}%;
                    background: #2f806a;
                    transition: width 0.3s;
                "
            ></div>
        </div>

        <button
            type="button"
            id="registrarEstudoAPI"
            class="quiz-btn"
            style="
                margin-top: 12px;
                background: linear-gradient(120deg, #8952f5, #7025d9);
                color: white;
                border: none;
                cursor: pointer;
            "
        >
            Marcar conteúdo estudado
        </button>

        <p
            id="progressoCursoAviso"
            aria-live="polite"
        ></p>
    `;

    const principal = document.querySelector('main');
    const cartaoQuiz = document.querySelector('.quiz-card');

    if (cartaoQuiz) {
        cartaoQuiz.insertAdjacentElement('beforebegin', painel);
    } else if (principal) {
        principal.appendChild(painel);
    }
}


function normalizarCurso(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}


function mostrarAviso(texto) {
    const principal = document.querySelector('main');

    if (!principal) return;

    const aviso = document.createElement('p');
    aviso.textContent = texto;
    aviso.setAttribute('role', 'status');

    aviso.style.cssText = `
        padding: 12px;
        margin: 12px auto;
        max-width: 900px;
        background: #fff7df;
        border-radius: 8px;
    `;

    principal.prepend(aviso);
}
