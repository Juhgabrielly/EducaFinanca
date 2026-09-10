const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { nome, telefone, email, senha, tipo, plano, status } = req.body;

        const usuario = await prisma.usuarios.create({
            data: {
                nome,
                telefone,
                email,
                senha,
                tipo,
                plano,
                status
            }
        });

        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar usuário',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const usuarios = await prisma.usuarios.findMany();

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar usuários',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const usuario = await prisma.usuarios.findUnique({
            where: {
                id: id
            }
        });

        if (!usuario) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar usuário',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { nome, telefone, email, senha, tipo, plano, status } = req.body;

        const usuario = await prisma.usuarios.update({
            where: {
                id: id
            },
            data: {
                nome,
                telefone,
                email,
                senha,
                tipo,
                plano,
                status
            }
        });

        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar usuário',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.usuarios.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Usuário excluído com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir usuário',
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