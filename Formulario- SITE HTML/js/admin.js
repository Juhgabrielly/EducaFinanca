const usuarioAdmin = obterUsuario();

if (!usuarioAdmin) {
    window.location.href = "../login.html";
}

async function carregarDashboard() {
    try {
        const [usuarios, cursos] = await Promise.all([
            requisicaoAPI("/usuarios/listar"),
            requisicaoAPI("/cursos/listar")
        ]);

        const listaUsuarios = Array.isArray(usuarios)
            ? usuarios
            : usuarios.usuarios || [];

        const listaCursos = Array.isArray(cursos)
            ? cursos
            : cursos.cursos || [];

        // Total de usuários
        document.getElementById("totalUsuarios").textContent =
            listaUsuarios.length;

        // Total de usuários Premium
        const premium = listaUsuarios.filter(
            item => item.plano === "PREMIUM"
        );

        document.getElementById("totalPremium").textContent =
            premium.length;

        // Total de cursos
        document.getElementById("totalCursos").textContent =
            listaCursos.length;

        // Nome do administrador
        document.getElementById("nomeAdmin").textContent =
            usuarioAdmin.nome || "Administrador";

        // Usuários  recentes
        const recentes = [...listaUsuarios].sort((a, b) => {
            return new Date(b.criado_em) - new Date(a.criado_em);
        }).slice(0, 5);

        const tabela = document.getElementById("tabelaUsuarios");

        tabela.innerHTML = "";

        recentes.forEach(item => {
            const linha = document.createElement("tr");

            const nome = document.createElement("td");
            nome.textContent = item.nome;

            const email = document.createElement("td");
            email.textContent = item.email;

            const plano = document.createElement("td");
            plano.textContent = item.plano;

            const tipo = document.createElement("td");
            tipo.textContent = item.tipo;

            linha.append(nome, email, plano, tipo);

            tabela.appendChild(linha);
        });

        // Cursos concluídos
        try {
            const progressos = await requisicaoAPI(
                "/progressoCursos/listar"
            );

            const listaProgressos = Array.isArray(progressos)
                ? progressos
                : progressos.progressos || [];

            const concluidos = listaProgressos.filter(item =>
                item.concluido === true ||
                Number(item.concluido) === 1 ||
                Number(item.progresso) >= 100
            );

            document.getElementById("totalConcluidos").textContent =
                concluidos.length;

        } catch (erro) {
            console.warn(
                "Não foi possível carregar os cursos concluídos:",
                erro.message
            );

            document.getElementById("totalConcluidos").textContent = "—";
        }

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);

        alert("Erro ao carregar os dados: " + erro.message);
    }
}

if (usuarioAdmin) {
    carregarDashboard();
}

document.getElementById("sair").addEventListener("click", () => {
    encerrarSessao();
    window.location.href = "../login.html";
});
