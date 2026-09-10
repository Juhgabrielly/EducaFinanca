const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { titulo, descricao, conteudo, exclusivo } = req.body;

        const curso = await prisma.cursos.create({
            data: {
                titulo,
                descricao,
                conteudo,
                exclusivo
            }
        });

        res.status(201).json(curso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar curso',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const cursos = await prisma.cursos.findMany();

        res.json(cursos);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar cursos',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const curso = await prisma.cursos.findUnique({
            where: {
                id: id
            }
        });

        if (!curso) {
            return res.status(404).json({
                erro: 'Curso não encontrado'
            });
        }

        res.json(curso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar curso',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { titulo, descricao, conteudo, exclusivo } = req.body;

        const curso = await prisma.cursos.update({
            where: {
                id: id
            },
            data: {
                titulo,
                descricao,
                conteudo,
                exclusivo
            }
        });

        res.json(curso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar curso',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.cursos.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Curso excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir curso',
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
