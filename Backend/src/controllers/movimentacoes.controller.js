const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            usuario_id,
            tipo,
            valor,
            descricao,
            data_movimentacao
        } = req.body;

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
        res.status(500).json({
            erro: 'Erro ao cadastrar movimentação',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const movimentacoes = await prisma.movimentacoes.findMany();

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

        const movimentacao = await prisma.movimentacoes.findUnique({
            where: {
                id: id
            }
        });

        if (!movimentacao) {
            return res.status(404).json({
                erro: 'Movimentação não encontrada'
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

        const {
            usuario_id,
            tipo,
            valor,
            descricao,
            data_movimentacao
        } = req.body;

        const movimentacao = await prisma.movimentacoes.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                tipo,
                valor,
                descricao,
                data_movimentacao: new Date(data_movimentacao)
            }
        });

        res.json(movimentacao);
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

        await prisma.movimentacoes.delete({
            where: {
                id: id
            }
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