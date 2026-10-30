document.addEventListener("DOMContentLoaded", async () => {
    const usuarioAdmin = obterUsuario();
    const token = obterToken();

    const tabela = document.getElementById("tabelaResultados");
    const pesquisa = document.getElementById("pesquisarResultado");
    const mensagem = document.getElementById("mensagemAdmin");

    if (!token || !usuarioAdmin || usuarioAdmin.tipo !== "ADMIN") {
        window.location.href = "../login.html";
        return;
    }

    document.getElementById("nomeAdmin").textContent =
        usuarioAdmin.nome || "Administrador";

    let resultados = [];
    let usuarios = [];
    let quizzes = [];

    function obterLista(resposta) {
        if (Array.isArray(resposta)) return resposta;

        return resposta?.dados ||
            resposta?.resultados ||
            resposta?.usuarios ||
            resposta?.quizzes ||
            [];
    }

    async function carregarResultados() {
        try {
            const [
                respostaResultados,
                respostaUsuarios,
                respostaQuizzes
            ] = await Promise.all([
                EducaAPI.get("/resultadosQuiz/listar"),
                EducaAPI.get("/usuarios/listar"),
                EducaAPI.get("/quizzes/listar")
            ]);

            resultados = obterLista(respostaResultados);
            usuarios = obterLista(respostaUsuarios);
            quizzes = obterLista(respostaQuizzes);

            resultados.sort((a, b) =>
                new Date(b.realizado_em || 0) -
                new Date(a.realizado_em || 0)
            );

            mostrarResultados(resultados);
            mensagem.textContent = "";

        } catch (erro) {
            console.error("Erro ao carregar resultados:", erro);

            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="vazio">
                        Não foi possível carregar os resultados.
                    </td>
                </tr>
            `;

            mensagem.textContent =
                "Erro ao carregar dados: " + erro.message;
        }
    }

    function mostrarResultados(lista) {
        tabela.innerHTML = "";

        if (lista.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="vazio">
                        Nenhum resultado encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        lista.forEach(resultado => {
            const usuario = usuarios.find(item =>
                Number(item.id) === Number(resultado.usuario_id)
            );

            const quiz = quizzes.find(item =>
                Number(item.id) === Number(resultado.quiz_id)
            );

            const linha = document.createElement("tr");

            const id = document.createElement("td");
            id.textContent = resultado.id;

            const nome = document.createElement("td");
            nome.textContent =
                usuario?.nome || `Usuário ${resultado.usuario_id}`;

            const tituloQuiz = document.createElement("td");
            tituloQuiz.textContent =
                quiz?.titulo || `Quiz ${resultado.quiz_id}`;

            const pontuacao = document.createElement("td");
            pontuacao.textContent =
                `${Number(resultado.pontuacao || 0)}%`;

            const data = document.createElement("td");
            const dataConvertida = new Date(resultado.realizado_em);

            data.textContent =
                resultado.realizado_em &&
                !isNaN(dataConvertida.getTime())
                    ? dataConvertida.toLocaleString("pt-BR")
                    : "—";

            linha.append(id, nome, tituloQuiz, pontuacao, data);
            tabela.appendChild(linha);
        });
    }

    pesquisa.addEventListener("input", () => {
        const termo = pesquisa.value.trim().toLowerCase();

        const filtrados = resultados.filter(resultado => {
            const usuario = usuarios.find(item =>
                Number(item.id) === Number(resultado.usuario_id)
            );

            const quiz = quizzes.find(item =>
                Number(item.id) === Number(resultado.quiz_id)
            );

            return (
                String(usuario?.nome || "").toLowerCase().includes(termo) ||
                String(usuario?.email || "").toLowerCase().includes(termo) ||
                String(quiz?.titulo || "").toLowerCase().includes(termo)
            );
        });

        mostrarResultados(filtrados);
    });

    document.getElementById("sair").addEventListener("click", () => {
        encerrarSessao();
        window.location.href = "../login.html";
    });

    carregarResultados();
});
