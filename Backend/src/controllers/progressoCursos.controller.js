const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { usuario_id, curso_id, progresso, concluido } = req.body;

        const progressoCurso = await prisma.progresso_cursos.create({
            data: {
                usuario_id,
                curso_id,
                progresso,
                concluido
            }
        });

        res.status(201).json(progressoCurso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar progresso',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const progressos = await prisma.progresso_cursos.findMany();

        res.json(progressos);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar progressos',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const progresso = await prisma.progresso_cursos.findUnique({
            where: {
                id: id
            }
        });

        if (!progresso) {
            return res.status(404).json({
                erro: 'Progresso não encontrado'
            });
        }

        res.json(progresso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar progresso',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { usuario_id, curso_id, progresso, concluido } = req.body;

        const progressoCurso = await prisma.progresso_cursos.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                curso_id,
                progresso,
                concluido
            }
        });

        res.json(progressoCurso);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar progresso',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.progresso_cursos.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Progresso excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir progresso',
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