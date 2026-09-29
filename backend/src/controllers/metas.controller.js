const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            nome,
            valor_meta,
            valor_atual
        } = req.body;

        let usuario_id;

        if (req.usuario.tipo === 'ADMIN') {
            usuario_id = Number(req.body.usuario_id);

            if (!usuario_id || isNaN(usuario_id)) {
                return res.status(400).json({
                    erro: 'ID do usuário é obrigatório para o administrador'
                });
            }
        } else {
            usuario_id = req.usuario.id;
        }

        if (!nome || valor_meta === undefined) {
            return res.status(400).json({
                erro: 'Nome e valor da meta são obrigatórios'
            });
        }

        const meta = await prisma.metas.create({
            data: {
                usuario_id,
                nome,
                valor_meta,
                valor_atual: valor_atual !== undefined
                    ? valor_atual
                    : 0
            }
        });

        res.status(201).json(meta);

    } catch (error) {
        console.error('ERRO AO CADASTRAR META:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar meta',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const metas = req.usuario.tipo === 'ADMIN'
            ? await prisma.metas.findMany()
            : await prisma.metas.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da meta inválido'
            });
        }

        const meta = await prisma.metas.findUnique({
            where: { id }
        });

        if (!meta) {
            return res.status(404).json({
                erro: 'Meta não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            meta.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode acessar suas próprias metas'
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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da meta inválido'
            });
        }

        const meta = await prisma.metas.findUnique({
            where: { id }
        });

        if (!meta) {
            return res.status(404).json({
                erro: 'Meta não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            meta.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode alterar suas próprias metas'
            });
        }

        const {
            nome,
            valor_meta,
            valor_atual
        } = req.body;

        const dados = {};

        if (nome !== undefined) {
            dados.nome = nome;
        }

        if (valor_meta !== undefined) {
            dados.valor_meta = valor_meta;
        }

        if (valor_atual !== undefined) {
            dados.valor_atual = valor_atual;
        }

        const resultado = await prisma.metas.update({
            where: { id },
            data: dados
        });

        res.json(resultado);

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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da meta inválido'
            });
        }

        const meta = await prisma.metas.findUnique({
            where: { id }
        });

        if (!meta) {
            return res.status(404).json({
                erro: 'Meta não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            meta.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode excluir suas próprias metas'
            });
        }

        await prisma.metas.delete({
            where: { id }
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