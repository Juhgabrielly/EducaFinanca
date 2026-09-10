const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { usuario_id, nome, valor_meta, valor_atual } = req.body;

        const meta = await prisma.metas.create({
            data: {
                usuario_id,
                nome,
                valor_meta,
                valor_atual
            }
        });

        res.status(201).json(meta);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar meta',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const metas = await prisma.metas.findMany();

        res.json(metas);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar metas',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const meta = await prisma.metas.findUnique({
            where: {
                id: id
            }
        });

        if (!meta) {
            return res.status(404).json({
                erro: 'Meta não encontrada'
            });
        }

        res.json(meta);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar meta',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { usuario_id, nome, valor_meta, valor_atual } = req.body;

        const meta = await prisma.metas.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                nome,
                valor_meta,
                valor_atual
            }
        });

        res.json(meta);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar meta',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.metas.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Meta excluída com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir meta',
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