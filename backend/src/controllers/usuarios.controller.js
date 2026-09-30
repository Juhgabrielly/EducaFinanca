const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const {
            nome,
            telefone,
            email,
            senha,
            tipo
        } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: 'Nome, email e senha são obrigatórios'
            });
        }

        const usuarioExistente = await prisma.usuarios.findUnique({
            where: {
                email
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                erro: 'Email já cadastrado'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuarios.create({
            data: {
                nome,
                telefone,
                email,
                senha: senhaHash,
                tipo: tipo || 'USUARIO',
                plano: 'FREE',
                status: true
            }
        });

        res.status(201).json({
            id: usuario.id,
            nome: usuario.nome,
            telefone: usuario.telefone,
            email: usuario.email,
            tipo: usuario.tipo,
            plano: usuario.plano,
            status: usuario.status,
            criado_em: usuario.criado_em
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            senha
        } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                erro: 'Email e senha são obrigatórios'
            });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: {
                email
            }
        });

        if (!usuario) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        if (!usuario.status) {
            return res.status(403).json({
                erro: 'Usuário inativo'
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                erro: 'Email ou senha inválidos'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                plano: usuario.plano
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h'
            }
        );

        res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                telefone: usuario.telefone,
                email: usuario.email,
                tipo: usuario.tipo,
                plano: usuario.plano,
                status: usuario.status
            }
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao realizar login'
        });
    }
};

const listar = async (req, res) => {
    try {
        const usuarios = await prisma.usuarios.findMany({
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo: true,
                plano: true,
                status: true,
                criado_em: true
            }
        });

        res.status(200).json(usuarios);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao listar usuários'
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

        if (req.usuario.tipo !== 'ADMIN' && req.usuario.id !== id) {
            return res.status(403).json({
                erro: 'Você só pode acessar sua própria conta'
            });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo: true,
                plano: true,
                status: true,
                criado_em: true
            }
        });

        if (!usuario) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        res.status(200).json(usuario);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao buscar usuário'
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

        if (req.usuario.tipo !== 'ADMIN' && req.usuario.id !== id) {
            return res.status(403).json({
                erro: 'Você só pode atualizar sua própria conta'
            });
        }

        const usuarioExistente = await prisma.usuarios.findUnique({
            where: {
                id
            }
        });

        if (!usuarioExistente) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        const {
            nome,
            telefone,
            email,
            senha,
            tipo,
            plano,
            status
        } = req.body;

        const dados = {};

        if (nome !== undefined) {
            dados.nome = nome;
        }

        if (telefone !== undefined) {
            dados.telefone = telefone;
        }

        if (email !== undefined) {
            dados.email = email;
        }

        if (senha !== undefined) {
            dados.senha = await bcrypt.hash(senha, 10);
        }

        if (plano !== undefined) {
            dados.plano = plano;
        }

        if (status !== undefined) {
            dados.status = status;
        }

        if (req.usuario.tipo === 'ADMIN' && tipo !== undefined) {
            dados.tipo = tipo;
        }

        const usuario = await prisma.usuarios.update({
            where: {
                id
            },
            data: dados
        });

        res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                telefone: usuario.telefone,
                email: usuario.email,
                tipo: usuario.tipo,
                plano: usuario.plano,
                status: usuario.status,
                criado_em: usuario.criado_em
            }
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao atualizar usuário'
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

        if (req.usuario.tipo !== 'ADMIN' && req.usuario.id !== id) {
            return res.status(403).json({
                erro: 'Você só pode excluir sua própria conta'
            });
        }

        const usuario = await prisma.usuarios.findUnique({
            where: {
                id
            }
        });

        if (!usuario) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        await prisma.usuarios.delete({
            where: {
                id
            }
        });

        res.status(200).json({
            mensagem: 'Usuário excluído com sucesso'
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao excluir usuário'
        });
    }
};


module.exports = {
    cadastrar,
    login,
    listar,
    buscar,
    atualizar,
    excluir
};