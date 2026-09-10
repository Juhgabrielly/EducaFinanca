const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            usuario_id,
            tipo_investimento_id,
            nome,
            valor_investido,
            valor_atual,
            rentabilidade
        } = req.body;

        const investimento = await prisma.investimentos.create({
            data: {
                usuario_id,
                tipo_investimento_id,
                nome,
                valor_investido,
                valor_atual,
                rentabilidade
            }
        });

        res.status(201).json(investimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar investimento',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const investimentos = await prisma.investimentos.findMany();

        res.json(investimentos);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar investimentos',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const investimento = await prisma.investimentos.findUnique({
            where: {
                id: id
            }
        });

        if (!investimento) {
            return res.status(404).json({
                erro: 'Investimento não encontrado'
            });
        }

        res.json(investimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar investimento',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            usuario_id,
            tipo_investimento_id,
            nome,
            valor_investido,
            valor_atual,
            rentabilidade
        } = req.body;

        const investimento = await prisma.investimentos.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                tipo_investimento_id,
                nome,
                valor_investido,
                valor_atual,
                rentabilidade
            }
        });

        res.json(investimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar investimento',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.investimentos.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Investimento excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir investimento',
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