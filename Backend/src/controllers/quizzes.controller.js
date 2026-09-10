const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { curso_id, titulo, descricao, exclusivo } = req.body;

        const quiz = await prisma.quizzes.create({
            data: {
                curso_id,
                titulo,
                descricao,
                exclusivo
            }
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar quiz',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const quizzes = await prisma.quizzes.findMany();

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar quizzes',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const quiz = await prisma.quizzes.findUnique({
            where: {
                id: id
            }
        });

        if (!quiz) {
            return res.status(404).json({
                erro: 'Quiz não encontrado'
            });
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar quiz',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { curso_id, titulo, descricao, exclusivo } = req.body;

        const quiz = await prisma.quizzes.update({
            where: {
                id: id
            },
            data: {
                curso_id,
                titulo,
                descricao,
                exclusivo
            }
        });

        res.json(quiz);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar quiz',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.quizzes.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Quiz excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir quiz',
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