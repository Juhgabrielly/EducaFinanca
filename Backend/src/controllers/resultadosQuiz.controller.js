const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { usuario_id, quiz_id, pontuacao, realizado_em } = req.body;

        const resultado = await prisma.resultados_quiz.create({
            data: {
                usuario_id,
                quiz_id,
                pontuacao,
                realizado_em: realizado_em ? new Date(realizado_em) : undefined
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
        const resultados = await prisma.resultados_quiz.findMany();

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

        const resultado = await prisma.resultados_quiz.findUnique({
            where: {
                id: id
            }
        });

        if (!resultado) {
            return res.status(404).json({
                erro: 'Resultado não encontrado'
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

        const { usuario_id, quiz_id, pontuacao, realizado_em } = req.body;

        const resultado = await prisma.resultados_quiz.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                quiz_id,
                pontuacao,
                realizado_em: realizado_em ? new Date(realizado_em) : undefined
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
            where: {
                id: id
            }
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