const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
  const item = await prisma.progressoCurso.create({
    data: req.body
  });

  return res.status(201).json(item);
};

const listar = async (req, res) => {
  const lista = await prisma.progressoCurso.findMany();

  return res.status(200).json(lista);
};

const buscar = async (req, res) => {
  const { id } = req.params;

  const item = await prisma.progressoCurso.findUnique({
    where: { id: Number(id) }
  });

  return res.status(200).json(item);
};

const atualizar = async (req, res) => {
  const { id } = req.params;

  const item = await prisma.progressoCurso.update({
    where: { id: Number(id) },
    data: req.body
  });

  return res.status(200).json(item);
};

const excluir = async (req, res) => {
  const { id } = req.params;

  const item = await prisma.progressoCurso.delete({
    where: { id: Number(id) }
  });

  return res.status(200).json(item);
};


module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
};
