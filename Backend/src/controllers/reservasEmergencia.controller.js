const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const { usuario_id, valor } = req.body;

        const reserva = await prisma.reservas_emergencia.create({
            data: {
                usuario_id,
                valor
            }
        });

        res.status(201).json(reserva);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar reserva de emergência',
            detalhes: error.message
        });
    }
};

const listar = async (req, res) => {
    try {
        const reservas = await prisma.reservas_emergencia.findMany();

        res.json(reservas);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar reservas de emergência',
            detalhes: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const reserva = await prisma.reservas_emergencia.findUnique({
            where: {
                id: id
            }
        });

        if (!reserva) {
            return res.status(404).json({
                erro: 'Reserva de emergência não encontrada'
            });
        }

        res.json(reserva);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao buscar reserva de emergência',
            detalhes: error.message
        });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const { usuario_id, valor } = req.body;

        const reserva = await prisma.reservas_emergencia.update({
            where: {
                id: id
            },
            data: {
                usuario_id,
                valor
            }
        });

        res.json(reserva);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao atualizar reserva de emergência',
            detalhes: error.message
        });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.reservas_emergencia.delete({
            where: {
                id: id
            }
        });

        res.json({
            mensagem: 'Reserva de emergência excluída com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao excluir reserva de emergência',
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