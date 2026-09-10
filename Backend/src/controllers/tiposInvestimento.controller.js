const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        const tipoInvestimento = await prisma.tipos_investimento.create({
            data: {
                nome,
                descricao
            }
        });

        res.status(201).json(tipoInvestimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar tipo de investimento',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const tiposInvestimento = await prisma.tipos_investimento.findMany();

        res.json(tiposInvestimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar tipos de investimento',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const tipoInvestimento = await prisma.tipos_investimento.findUnique({
            where: {
                id: id
            }
        });

        if (!tipoInvestimento) {
            return res.status(404).json({
                erro: 'Tipo de investimento não encontrado'
            });
        }

        res.json(tipoInvestimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar tipo de investimento',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { nome, descricao } = req.body;

        const tipoInvestimento = await prisma.tipos_investimento.update({
            where: {
                id: id
            },
            data: {
                nome,
                descricao
            }
        });

        res.json(tipoInvestimento);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar tipo de investimento',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.tipos_investimento.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Tipo de investimento excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir tipo de investimento',
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