const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: 'Nome do tipo de investimento é obrigatório'
            });
        }

        const tipo = await prisma.tipos_investimento.create({
            data: {
                nome,
                descricao
            }
        });

        res.status(201).json(tipo);

    } catch (error) {
        console.error('ERRO AO CADASTRAR TIPO:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar tipo de investimento',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const tipos = await prisma.tipos_investimento.findMany();

        res.status(200).json(tipos);

    } catch (error) {
        console.error('ERRO AO LISTAR TIPOS:', error);

        res.status(500).json({
            erro: 'Erro ao listar tipos de investimento',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do tipo de investimento inválido'
            });
        }

        const tipo = await prisma.tipos_investimento.findUnique({
            where: { id }
        });

        if (!tipo) {
            return res.status(404).json({
                erro: 'Tipo de investimento não encontrado'
            });
        }

        res.status(200).json(tipo);

    } catch (error) {
        console.error('ERRO AO BUSCAR TIPO:', error);

        res.status(500).json({
            erro: 'Erro ao buscar tipo de investimento',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do tipo de investimento inválido'
            });
        }

        const tipoExistente = await prisma.tipos_investimento.findUnique({
            where: { id }
        });

        if (!tipoExistente) {
            return res.status(404).json({
                erro: 'Tipo de investimento não encontrado'
            });
        }

        const { nome, descricao } = req.body;

        const dados = {};

        if (nome !== undefined) {
            dados.nome = nome;
        }

        if (descricao !== undefined) {
            dados.descricao = descricao;
        }

        const tipo = await prisma.tipos_investimento.update({
            where: { id },
            data: dados
        });

        res.status(200).json(tipo);

    } catch (error) {
        console.error('ERRO AO ATUALIZAR TIPO:', error);

        res.status(500).json({
            erro: 'Erro ao atualizar tipo de investimento',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do tipo de investimento inválido'
            });
        }

        const tipo = await prisma.tipos_investimento.findUnique({
            where: { id }
        });

        if (!tipo) {
            return res.status(404).json({
                erro: 'Tipo de investimento não encontrado'
            });
        }

        await prisma.tipos_investimento.delete({
            where: { id }
        });

        res.status(200).json({
            mensagem: 'Tipo de investimento excluído com sucesso'
        });

    } catch (error) {
        console.error('ERRO AO EXCLUIR TIPO:', error);

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