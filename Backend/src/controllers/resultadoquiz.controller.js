const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const data = req.body;

    const item = await prisma.resultadoQuiz.create({
        data
    });

    res.status(201).json(item);
};

const listar = async (req, res) => {
    const lista = await prisma.resultadoQuiz.findMany();

    res.status(200).json(lista);
};

const buscar = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.resultadoQuiz.findUnique({
        where: { id: Number(id) }
    });

    res.status(200).json(item);
};

const atualizar = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.resultadoQuiz.update({
        where: { id: Number(id) },
        data: req.body
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.resultadoQuiz.delete({
        where: { id: Number(id) }
    });

    res.status(200).json(item);
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
};