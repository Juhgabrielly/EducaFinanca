const usuario = obterUsuario();

if (!usuario) {
    window.location.href = "../login.html";
}

async function carregarDashboard() {

    try {

        const [usuarios, cursos, progressos] = await Promise.all([

            requisicaoAPI("/usuarios/listar"),

            requisicaoAPI("/cursos/listar"),

            requisicaoAPI("/progressoCursos/listar")

        ]);

        const listaUsuarios = Array.isArray(usuarios)
            ? usuarios
            : usuarios.usuarios || [];

        const listaCursos = Array.isArray(cursos)
            ? cursos
            : cursos.cursos || [];

        const listaProgressos = Array.isArray(progressos)
            ? progressos
            : progressos.progressos || [];

        document.getElementById("totalUsuarios").textContent =
            listaUsuarios.length;

        const premium = listaUsuarios.filter(
            usuario => usuario.plano === "PREMIUM"
        );

        document.getElementById("totalPremium").textContent =
            premium.length;

        document.getElementById("totalCursos").textContent =
            listaCursos.length;

        const concluidos = listaProgressos.filter(
            progresso =>
                progresso.concluido === true ||
                progresso.concluido === 1
        );

        document.getElementById("totalConcluidos").textContent =
            concluidos.length;

        document.getElementById("nomeAdmin").textContent =
            usuario.nome;

        const tabela = document.getElementById("tabelaUsuarios");

        tabela.innerHTML = "";

        listaUsuarios.slice(0, 5).forEach(usuario => {

            const linha = document.createElement("tr");

            const nome = document.createElement("td");
            nome.textContent = usuario.nome;

            const email = document.createElement("td");
            email.textContent = usuario.email;

            const plano = document.createElement("td");
            plano.textContent = usuario.plano;

            const tipo = document.createElement("td");
            tipo.textContent = usuario.tipo;

            linha.append(nome, email, plano, tipo);

            tabela.appendChild(linha);

        });

    } catch (erro) {

        console.error("Erro ao carregar dashboard:", erro);

        alert("Erro ao carregar os dados: " + erro.message);

    }

}

if (usuario) {
    carregarDashboard();
}

document.getElementById("sair").addEventListener("click", () => {

    encerrarSessao();

    window.location.href = "../login.html";

});