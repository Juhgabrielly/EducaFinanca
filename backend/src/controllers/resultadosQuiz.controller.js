const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const quiz_id = Number(req.body.quiz_id);
        const respostas = req.body.respostas;
        if (!Number.isInteger(quiz_id) || quiz_id <= 0 || !Array.isArray(respostas) || respostas.length === 0) {
            return res.status(400).json({ erro: 'Envie quiz_id e as respostas do quiz' });
        }
        const quiz = await prisma.quizzes.findUnique({ where: { id: quiz_id } });
        if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado' });
        const todasQuestoes = await prisma.questoes.findMany({ where: { quiz_id } });
        if (!todasQuestoes.length) return res.status(400).json({ erro: 'Este quiz ainda não possui perguntas cadastradas' });
        const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR');
        const respostasPorQuestao = new Map();
        for (const item of respostas) {
            const questaoId = Number(item.questao_id);
            if (!Number.isInteger(questaoId) || !todasQuestoes.some(questao => questao.id === questaoId)) {
                return res.status(400).json({ erro: 'Uma das perguntas enviadas não pertence a este quiz' });
            }
            respostasPorQuestao.set(questaoId, normalizar(item.resposta));
        }
        const questoesRespondidas = todasQuestoes.filter(questao => respostasPorQuestao.has(questao.id));
        let acertos = 0;
        for (const questao of questoesRespondidas) {
            const resposta = respostasPorQuestao.get(questao.id) || '';
            const corretaOriginal = String(questao.resposta_correta).trim();
            const correta = normalizar(corretaOriginal);
            const letraCorreta = corretaOriginal.match(/^\s*([a-d])\s*[:.)-]/i)?.[1]?.toLowerCase();
            if (resposta && (resposta === correta || (letraCorreta && resposta === letraCorreta))) acertos++;
        }
        const total = questoesRespondidas.length;
        const pontuacao = Number(((acertos / total) * 100).toFixed(2));
        const resultado = await prisma.resultados_quiz.create({
            data: { usuario_id: req.usuario.id, quiz_id, pontuacao }
        });
        return res.status(201).json({ ...resultado, acertos, total, pontuacao });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao registrar resultado do quiz', detalhes: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const resultados = req.usuario.tipo === 'ADMIN'
            ? await prisma.resultados_quiz.findMany()
            : await prisma.resultados_quiz.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

        res.json(resultados);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar resultados',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const resultado =
            await prisma.resultados_quiz.findUnique({
                where: { id }
            });

        if (!resultado) {
            return res.status(404).json({
                erro: 'Resultado não encontrado'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            resultado.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode visualizar seus próprios resultados'
            });
        }

        res.json(resultado);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar resultado',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            usuario_id,
            quiz_id,
            pontuacao,
            realizado_em
        } = req.body;

        const resultado =
            await prisma.resultados_quiz.update({
                where: { id },
                data: {
                    usuario_id: Number(usuario_id),
                    quiz_id: Number(quiz_id),
                    pontuacao,
                    realizado_em: realizado_em
                        ? new Date(realizado_em)
                        : undefined
                }
            });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar resultado',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.resultados_quiz.delete({
            where: { id }
        });

        res.json({
            mensagem: 'Resultado excluído com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir resultado',
            detalhes: error.message
        });
    }
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
};