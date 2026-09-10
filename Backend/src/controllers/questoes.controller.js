const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { quiz_id, pergunta, resposta_correta } = req.body;

        const questao = await prisma.questoes.create({
            data: {
                quiz_id,
                pergunta,
                resposta_correta
            }
        });

        res.status(201).json(questao);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar questão',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const questoes = await prisma.questoes.findMany();

        res.json(questoes);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar questões',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const questao = await prisma.questoes.findUnique({
            where: {
                id: id
            }
        });

        if (!questao) {
            return res.status(404).json({
                erro: 'Questão não encontrada'
            });
        }

        res.json(questao);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar questão',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { quiz_id, pergunta, resposta_correta } = req.body;

        const questao = await prisma.questoes.update({
            where: {
                id: id
            },
            data: {
                quiz_id,
                pergunta,
                resposta_correta
            }
        });

        res.json(questao);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar questão',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.questoes.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Questão excluída com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir questão',
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