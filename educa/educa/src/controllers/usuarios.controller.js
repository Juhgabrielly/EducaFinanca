const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    console.log("ENTROU NO CADASTRAR");
    console.log(req.body);

    const data = req.body;

    const item = await prisma.usuarios.create({
        data
    });

    res.status(201).json(item);
};

   const listar = async (req, res) => {
    const lista = await prisma.usuarios.findMany();

    res.status(200).json(lista);
};

const buscar = async (req, res) => {
    const { id } = req.params;
    
    const item = await prisma.usuarios.findUnique({
        where: { id : Number(id) }
    });

    res.status(200).json(item);
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;
    const item = await prisma.usuarios.update({
        where: { id : Number(id) },
        data: dados
    });

   res.status(200).json(item);
};

const excluir = async (req, res) => {
    const { id } = req.params;
    
    const item = await prisma.usuarios.delete({
        where: { id : Number(id) }
    });

  res.status(200).json(item);
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
}
