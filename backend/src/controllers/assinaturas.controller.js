const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const plano = req.body.plano;
        if (!['FREE', 'PREMIUM'].includes(plano)) {
            return res.status(400).json({ erro: 'Plano inválido' });
        }
        const usuario_id = req.usuario.tipo === 'ADMIN' && req.body.usuario_id
            ? Number(req.body.usuario_id)
            : req.usuario.id;
        if (req.usuario.tipo !== 'ADMIN' && plano !== 'PREMIUM') {
            return res.status(400).json({ erro: 'Usuários podem registrar apenas a ativação Premium' });
        }
        const assinatura = await prisma.assinaturas.create({
            data: { usuario_id, plano, status: 'ATIVA', inicio: new Date(), fim: null }
        });
        if (plano === 'PREMIUM') {
            await prisma.usuarios.update({ where: { id: usuario_id }, data: { plano: 'PREMIUM' } });
        }
        return res.status(201).json(assinatura);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao cadastrar assinatura', detalhes: error.message });
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
        const existente = await prisma.assinaturas.findUnique({ where: { id } });
        if (!existente) return res.status(404).json({ erro: 'Assinatura não encontrada' });
        if (req.usuario.tipo !== 'ADMIN' && existente.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode alterar sua própria assinatura' });
        }
        let dados;
        if (req.usuario.tipo === 'ADMIN') {
            dados = {
                plano: req.body.plano || undefined,
                status: req.body.status || undefined,
                inicio: req.body.inicio ? new Date(req.body.inicio) : undefined,
                fim: req.body.fim ? new Date(req.body.fim) : undefined
            };
        } else {
            if (req.body.status !== 'CANCELADA') {
                return res.status(400).json({ erro: 'Usuários só podem cancelar a própria assinatura' });
            }
            dados = { status: 'CANCELADA', fim: new Date() };
        }
        const assinatura = await prisma.assinaturas.update({ where: { id }, data: dados });
        if (req.usuario.tipo === 'ADMIN' && req.body.status === 'CANCELADA' || req.usuario.tipo !== 'ADMIN') {
            const outraAtiva = await prisma.assinaturas.findFirst({ where: { usuario_id: existente.usuario_id, status: 'ATIVA', id: { not: id } } });
            if (!outraAtiva) await prisma.usuarios.update({ where: { id: existente.usuario_id }, data: { plano: 'FREE' } });
        }
        return res.json(assinatura);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao atualizar assinatura', detalhes: error.message });
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