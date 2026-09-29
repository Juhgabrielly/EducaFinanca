const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            usuario_id,
            quiz_id,
            pontuacao,
            realizado_em
        } = req.body;

        const resultado = await prisma.resultados_quiz.create({
            data: {
                usuario_id: Number(usuario_id),
                quiz_id: Number(quiz_id),
                pontuacao,
                realizado_em: realizado_em
                    ? new Date(realizado_em)
                    : undefined
            }
        });

        res.status(201).json(resultado);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar resultado',
            detalhes: error.message
        });
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