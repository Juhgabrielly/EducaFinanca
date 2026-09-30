const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            tipo,
            valor,
            descricao,
            data_movimentacao
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

        if (!tipo || valor === undefined || !data_movimentacao) {
            return res.status(400).json({
                erro: 'Tipo, valor e data da movimentação são obrigatórios'
            });
        }

        const movimentacao = await prisma.movimentacoes.create({
            data: {
                usuario_id,
                tipo,
                valor,
                descricao,
                data_movimentacao: new Date(data_movimentacao)
            }
        });

        res.status(201).json(movimentacao);

    } catch (error) {
        console.error('ERRO AO CADASTRAR MOVIMENTAÇÃO:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar movimentação',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const movimentacoes = req.usuario.tipo === 'ADMIN'
            ? await prisma.movimentacoes.findMany()
            : await prisma.movimentacoes.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

        res.json(movimentacoes);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar movimentações',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da movimentação inválido'
            });
        }

        const movimentacao = await prisma.movimentacoes.findUnique({
            where: { id }
        });

        if (!movimentacao) {
            return res.status(404).json({
                erro: 'Movimentação não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            movimentacao.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode acessar suas próprias movimentações'
            });
        }

        res.json(movimentacao);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar movimentação',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da movimentação inválido'
            });
        }

        const movimentacao = await prisma.movimentacoes.findUnique({
            where: { id }
        });

        if (!movimentacao) {
            return res.status(404).json({
                erro: 'Movimentação não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            movimentacao.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode alterar suas próprias movimentações'
            });
        }

        const {
            tipo,
            valor,
            descricao,
            data_movimentacao
        } = req.body;

        const dados = {};

        if (tipo !== undefined) {
            dados.tipo = tipo;
        }

        if (valor !== undefined) {
            dados.valor = valor;
        }

        if (descricao !== undefined) {
            dados.descricao = descricao;
        }

        if (data_movimentacao !== undefined) {
            dados.data_movimentacao = new Date(data_movimentacao);
        }

        const resultado = await prisma.movimentacoes.update({
            where: { id },
            data: dados
        });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar movimentação',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da movimentação inválido'
            });
        }

        const movimentacao = await prisma.movimentacoes.findUnique({
            where: { id }
        });

        if (!movimentacao) {
            return res.status(404).json({
                erro: 'Movimentação não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            movimentacao.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode excluir suas próprias movimentações'
            });
        }

        await prisma.movimentacoes.delete({
            where: { id }
        });

        res.json({
            mensagem: 'Movimentação excluída com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir movimentação',
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