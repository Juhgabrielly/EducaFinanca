const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { usuario_id, plano, status, inicio, fim } = req.body;

        const assinatura = await prisma.assinaturas.create({
            data: {
                usuario_id,
                plano,
                status,
                inicio: inicio ? new Date(inicio) : undefined,
                fim: fim ? new Date(fim) : null
            }
        });

        res.status(201).json(assinatura);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar assinatura',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const assinaturas = await prisma.assinaturas.findMany();

        res.json(assinaturas);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar assinaturas',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const assinatura = await prisma.assinaturas.findUnique({
            where: {
                id: id
            }
        });

        if (!assinatura) {
            return res.status(404).json({
                erro: 'Assinatura não encontrada'
            });
        }

        res.json(assinatura);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar assinatura',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { usuario_id, plano, status, inicio, fim } = req.body;

        const assinatura = await prisma.assinaturas.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                plano,
                status,
                inicio: inicio ? new Date(inicio) : undefined,
                fim: fim ? new Date(fim) : null
            }
        });

        res.json(assinatura);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar assinatura',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.assinaturas.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Assinatura excluída com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir assinatura',
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