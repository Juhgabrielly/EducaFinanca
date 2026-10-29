const admin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({
            erro: 'Usuário não autenticado'
        });
    }

    if (req.usuario.tipo !== 'ADMIN') {
        return res.status(403).json({
            erro: 'Acesso permitido somente para administradores'
        });
    }

    next();
};

module.exports = admin;