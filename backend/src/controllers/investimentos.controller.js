const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            tipo_investimento_id,
            nome,
            valor_investido,
            valor_atual,
            rentabilidade
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

        if (!tipo_investimento_id || isNaN(Number(tipo_investimento_id))) {
            return res.status(400).json({
                erro: 'Tipo de investimento é obrigatório'
            });
        }

        if (!nome || valor_investido === undefined) {
            return res.status(400).json({
                erro: 'Nome e valor investido são obrigatórios'
            });
        }

        const investimento = await prisma.investimentos.create({
            data: {
                usuario_id,
                tipo_investimento_id: Number(tipo_investimento_id),
                nome,
                valor_investido,
                valor_atual: valor_atual !== undefined
                    ? valor_atual
                    : 0,
                rentabilidade: rentabilidade !== undefined
                    ? rentabilidade
                    : 0
            }
        });

        res.status(201).json(investimento);

    } catch (error) {
        console.error('ERRO AO CADASTRAR INVESTIMENTO:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar investimento',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const investimentos = req.usuario.tipo === 'ADMIN'
            ? await prisma.investimentos.findMany()
            : await prisma.investimentos.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do investimento inválido'
            });
        }

        const investimento = await prisma.investimentos.findUnique({
            where: { id }
        });

        if (!investimento) {
            return res.status(404).json({
                erro: 'Investimento não encontrado'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            investimento.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode acessar seus próprios investimentos'
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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do investimento inválido'
            });
        }

        const investimento = await prisma.investimentos.findUnique({
            where: { id }
        });

        if (!investimento) {
            return res.status(404).json({
                erro: 'Investimento não encontrado'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            investimento.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode alterar seus próprios investimentos'
            });
        }

        const {
            tipo_investimento_id,
            nome,
            valor_investido,
            valor_atual,
            rentabilidade
        } = req.body;

        const dados = {};

        if (tipo_investimento_id !== undefined) {
            dados.tipo_investimento_id = Number(tipo_investimento_id);
        }

        if (nome !== undefined) {
            dados.nome = nome;
        }

        if (valor_investido !== undefined) {
            dados.valor_investido = valor_investido;
        }

        if (valor_atual !== undefined) {
            dados.valor_atual = valor_atual;
        }

        if (rentabilidade !== undefined) {
            dados.rentabilidade = rentabilidade;
        }

        const resultado = await prisma.investimentos.update({
            where: { id },
            data: dados
        });

        res.json(resultado);

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

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID do investimento inválido'
            });
        }

        const investimento = await prisma.investimentos.findUnique({
            where: { id }
        });

        if (!investimento) {
            return res.status(404).json({
                erro: 'Investimento não encontrado'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            investimento.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode excluir seus próprios investimentos'
            });
        }

        await prisma.investimentos.delete({
            where: { id }
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