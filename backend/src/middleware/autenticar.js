const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não está configurado');

            return res.status(500).json({
                erro: 'Configuração de autenticação ausente'
            });
        }

        const cabecalho = req.headers.authorization;

        if (!cabecalho) {
            return res.status(401).json({
                erro: 'Token não informado'
            });
        }

        const partes = cabecalho.split(' ');

        if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
            return res.status(401).json({
                erro: 'Formato do token inválido'
            });
        }

        const token = partes[1];

        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = usuario;

        next();

    } catch (erro) {
        console.error('Erro na autenticação:', erro.message);

        return res.status(401).json({
            erro: 'Token inválido ou expirado'
        });
    }
};

module.exports = autenticar;
