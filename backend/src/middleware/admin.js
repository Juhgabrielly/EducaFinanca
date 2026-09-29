const admin = (req, res, next) => {
    console.log('TIPO NO TOKEN:', req.usuario.tipo);

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