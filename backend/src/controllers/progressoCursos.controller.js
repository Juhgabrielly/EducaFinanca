const prisma = require('../data/prisma');

const cadastrar = async (req, res) => {
    try {
        const curso_id = Number(req.body.curso_id);
        const progresso = Number(req.body.progresso ?? 0);
        const concluido = Boolean(req.body.concluido ?? progresso >= 100);

        if (!Number.isInteger(curso_id) || curso_id <= 0) {
            return res.status(400).json({ erro: 'ID do curso inválido' });
        }
        if (!Number.isFinite(progresso) || progresso < 0 || progresso > 100) {
            return res.status(400).json({ erro: 'O progresso deve ficar entre 0 e 100' });
        }

        const curso = await prisma.cursos.findUnique({ where: { id: curso_id } });
        if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });

        const registro = await prisma.progresso_cursos.upsert({
            where: { usuario_id_curso_id: { usuario_id: req.usuario.id, curso_id } },
            create: { usuario_id: req.usuario.id, curso_id, progresso, concluido },
            update: { progresso, concluido }
        });
        return res.status(200).json(registro);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao salvar progresso', detalhes: error.message });
    }
};

const listar = async (req, res) => {
    try {
        const progressos = req.usuario.tipo === 'ADMIN'
            ? await prisma.progresso_cursos.findMany({ include: { curso: true } })
            : await prisma.progresso_cursos.findMany({ where: { usuario_id: req.usuario.id }, include: { curso: true } });
        return res.json(progressos);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao listar progressos', detalhes: error.message });
    }
};

const buscar = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return res.status(400).json({ erro: 'ID do progresso inválido' });
        const registro = await prisma.progresso_cursos.findUnique({ where: { id }, include: { curso: true } });
        if (!registro) return res.status(404).json({ erro: 'Progresso não encontrado' });
        if (req.usuario.tipo !== 'ADMIN' && registro.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode acessar seu próprio progresso' });
        }
        return res.json(registro);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao buscar progresso', detalhes: error.message });
    }
};

const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const registroAtual = await prisma.progresso_cursos.findUnique({ where: { id } });
        if (!registroAtual) return res.status(404).json({ erro: 'Progresso não encontrado' });
        if (req.usuario.tipo !== 'ADMIN' && registroAtual.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode alterar seu próprio progresso' });
        }
        const dados = {};
        if (req.body.progresso !== undefined) {
            const progresso = Number(req.body.progresso);
            if (!Number.isFinite(progresso) || progresso < 0 || progresso > 100) {
                return res.status(400).json({ erro: 'O progresso deve ficar entre 0 e 100' });
            }
            dados.progresso = progresso;
        }
        if (req.body.concluido !== undefined) dados.concluido = Boolean(req.body.concluido);
        const registro = await prisma.progresso_cursos.update({ where: { id }, data: dados });
        return res.json(registro);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao atualizar progresso', detalhes: error.message });
    }
};

const excluir = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const registro = await prisma.progresso_cursos.findUnique({ where: { id } });
        if (!registro) return res.status(404).json({ erro: 'Progresso não encontrado' });
        if (req.usuario.tipo !== 'ADMIN' && registro.usuario_id !== req.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode excluir seu próprio progresso' });
        }
        await prisma.progresso_cursos.delete({ where: { id } });
        return res.json({ mensagem: 'Progresso excluído com sucesso' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao excluir progresso', detalhes: error.message });
    }
};

module.exports = { cadastrar, listar, buscar, atualizar, excluir };
