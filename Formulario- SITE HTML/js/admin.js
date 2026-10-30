document.addEventListener("DOMContentLoaded", () => {

    const usuarioAdmin = obterUsuario();

    // Verificar se existe uma sessão de administrador
    if (!obterToken() || !usuarioAdmin || usuarioAdmin.tipo !== "ADMIN") {
        window.location.href = "../login.html";
        return;
    }

    document.getElementById("nomeAdmin").textContent =
        usuarioAdmin.nome || "Administrador";

    async function carregarDashboard() {
        const totalUsuarios = document.getElementById("totalUsuarios");
        const totalPremium = document.getElementById("totalPremium");
        const totalCursos = document.getElementById("totalCursos");
        const totalConcluidos = document.getElementById("totalConcluidos");
        const tabela = document.getElementById("tabelaUsuarios");

        try {
            const [respostaUsuarios, respostaCursos, respostaProgressos] =
                await Promise.all([
                    EducaAPI.get("/usuarios/listar"),
                    EducaAPI.get("/cursos/listar"),
                    EducaAPI.get("/progressoCursos/listar")
                ]);

            const usuarios = Array.isArray(respostaUsuarios)
                ? respostaUsuarios
                : respostaUsuarios.usuarios || [];

            const cursos = Array.isArray(respostaCursos)
                ? respostaCursos
                : respostaCursos.cursos || [];

            const progressos = Array.isArray(respostaProgressos)
                ? respostaProgressos
                : respostaProgressos.progressos || [];

            // Total de usuários
            totalUsuarios.textContent = usuarios.length;

            // Total de usuários Premium
            totalPremium.textContent = usuarios.filter(
                usuario => usuario.plano === "PREMIUM"
            ).length;

            // Total de cursos
            totalCursos.textContent = cursos.length;

            // Total de cursos concluídos
            totalConcluidos.textContent = progressos.filter(
                progresso =>
                    progresso.concluido === true ||
                    Number(progresso.concluido) === 1 ||
                    Number(progresso.progresso) >= 100
            ).length;

            // Mostrar os cinco usuários mais recentes
            const recentes = [...usuarios]
                .sort((a, b) =>
                    new Date(b.criado_em || 0) - new Date(a.criado_em || 0)
                )
                .slice(0, 5);

            tabela.innerHTML = "";

            if (recentes.length === 0) {
                tabela.innerHTML = `
                    <tr>
                        <td colspan="4">Nenhum usuário cadastrado.</td>
                    </tr>
                `;
                return;
            }

            recentes.forEach(usuario => {
                const linha = document.createElement("tr");

                const nome = document.createElement("td");
                nome.textContent = usuario.nome || "—";

                const email = document.createElement("td");
                email.textContent = usuario.email || "—";

                const plano = document.createElement("td");
                plano.textContent = usuario.plano || "FREE";

                const tipo = document.createElement("td");
                tipo.textContent = usuario.tipo || "USUARIO";

                linha.append(nome, email, plano, tipo);
                tabela.appendChild(linha);
            });

        } catch (erro) {
            console.error("Erro ao carregar Dashboard:", erro);

            totalUsuarios.textContent = "—";
            totalPremium.textContent = "—";
            totalCursos.textContent = "—";
            totalConcluidos.textContent = "—";

            tabela.innerHTML = `
                <tr>
                    <td colspan="4">
                        Não foi possível carregar os dados.
                    </td>
                </tr>
            `;
        }
    }

    carregarDashboard();

    // Encerrar sessão
    document.getElementById("sair").addEventListener("click", () => {
        encerrarSessao();
        window.location.href = "../login.html";
    });

});
