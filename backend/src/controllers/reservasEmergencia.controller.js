const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { valor } = req.body;

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

        if (valor === undefined) {
            return res.status(400).json({
                erro: 'Valor da reserva é obrigatório'
            });
        }

        // Verifica se o usuário já possui uma reserva
        const reservaExistente = await prisma.reservas_emergencia.findUnique({
            where: {
                usuario_id
            }
        });

        if (reservaExistente) {
            return res.status(400).json({
                erro: 'Este usuário já possui uma reserva de emergência'
            });
        }

        const reserva = await prisma.reservas_emergencia.create({
            data: {
                usuario_id,
                valor
            }
        });

        res.status(201).json(reserva);

    } catch (error) {
        console.error('ERRO AO CADASTRAR RESERVA:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar reserva',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const reservas = req.usuario.tipo === 'ADMIN'
            ? await prisma.reservas_emergencia.findMany()
            : await prisma.reservas_emergencia.findMany({
                where: {
                    usuario_id: req.usuario.id
                }
            });

        res.json(reservas);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar reservas',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da reserva inválido'
            });
        }

        const reserva = await prisma.reservas_emergencia.findUnique({
            where: { id }
        });

        if (!reserva) {
            return res.status(404).json({
                erro: 'Reserva não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            reserva.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode acessar sua própria reserva'
            });
        }

        res.json(reserva);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar reserva',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da reserva inválido'
            });
        }

        const reserva = await prisma.reservas_emergencia.findUnique({
            where: { id }
        });

        if (!reserva) {
            return res.status(404).json({
                erro: 'Reserva não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            reserva.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode alterar sua própria reserva'
            });
        }

        const { valor } = req.body;

        const dados = {};

        if (valor !== undefined) {
            dados.valor = valor;
        }

        const resultado = await prisma.reservas_emergencia.update({
            where: { id },
            data: dados
        });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar reserva',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID da reserva inválido'
            });
        }

        const reserva = await prisma.reservas_emergencia.findUnique({
            where: { id }
        });

        if (!reserva) {
            return res.status(404).json({
                erro: 'Reserva não encontrada'
            });
        }

        if (
            req.usuario.tipo !== 'ADMIN' &&
            reserva.usuario_id !== req.usuario.id
        ) {
            return res.status(403).json({
                erro: 'Você só pode excluir sua própria reserva'
            });
        }

        await prisma.reservas_emergencia.delete({
            where: { id }
        });

        res.json({
            mensagem: 'Reserva excluída com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir reserva',
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