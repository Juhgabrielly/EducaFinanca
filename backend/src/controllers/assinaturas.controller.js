const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { plano, status, inicio, fim } = req.body;

        const usuario_id = req.usuario.tipo === 'ADMIN'
            ? Number(req.body.usuario_id)
            : req.usuario.id;

        if (!usuario_id || isNaN(usuario_id)) {
            return res.status(400).json({
                erro: 'ID do usuário inválido'
            });
        }

        if (!plano) {
            return res.status(400).json({
                erro: 'Plano é obrigatório'
            });
        }

        const assinatura = await prisma.assinaturas.create({
            data: {
                usuario_id: usuario_id,
                plano: plano,
                status: status || 'ATIVA',
                inicio: inicio ? new Date(inicio) : new Date(),
                fim: fim ? new Date(fim) : null
            }
        });

        res.status(201).json(assinatura);

    } catch (error) {
        console.error('ERRO AO CADASTRAR ASSINATURA:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar assinatura',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const assinaturas = req.usuario.tipo === 'ADMIN'
            ? await prisma.assinaturas.findMany()
            : await prisma.assinaturas.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const assinatura = await prisma.assinaturas.findUnique({
            where: { id }
        });

        if (!assinatura) {
            return res.status(404).json({
                erro: 'Assinatura não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            assinatura.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode acessar sua própria assinatura'
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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const assinaturaExistente =
            await prisma.assinaturas.findUnique({
                where: { id }
            });

        if (!assinaturaExistente) {
            return res.status(404).json({
                erro: 'Assinatura não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            assinaturaExistente.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode alterar sua própria assinatura'
            });
        }

        const {
            plano,
            status,
            inicio,
            fim
        } = req.body;

        const assinatura = await prisma.assinaturas.update({
            where: { id },
            data: {
                plano: plano || undefined,
                status: status || undefined,
                inicio: inicio ? new Date(inicio) : undefined,
                fim: fim ? new Date(fim) : undefined
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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido'
            });
        }

        const assinatura = await prisma.assinaturas.findUnique({
            where: { id }
        });

        if (!assinatura) {
            return res.status(404).json({
                erro: 'Assinatura não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            assinatura.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode excluir sua própria assinatura'
            });
        }

        await prisma.assinaturas.delete({
            where: { id }
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