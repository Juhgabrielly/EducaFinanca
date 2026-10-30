document.addEventListener("DOMContentLoaded", () => {

    const usuarioAdmin = obterUsuario();
    const token = obterToken();

    const tabela = document.getElementById("tabelaCursos");
    const modal = document.getElementById("modalCurso");
    const formulario = document.getElementById("formCurso");
    const mensagem = document.getElementById("mensagemAdmin");

    if (!token || !usuarioAdmin || usuarioAdmin.tipo !== "ADMIN") {
        window.location.href = "../login.html";
        return;
    }

    document.getElementById("nomeAdmin").textContent =
        usuarioAdmin.nome || "Administrador";

    async function carregarCursos() {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="vazio">Carregando cursos...</td>
            </tr>
        `;

        try {
            const resposta = await EducaAPI.get("/cursos/listar");

            const cursos = Array.isArray(resposta)
                ? resposta
                : resposta.cursos || resposta.dados || [];

            tabela.innerHTML = "";

            if (cursos.length === 0) {
                tabela.innerHTML = `
                    <tr>
                        <td colspan="5" class="vazio">
                            Nenhum curso cadastrado.
                        </td>
                    </tr>
                `;
                return;
            }

            cursos.forEach(curso => {
                const linha = document.createElement("tr");

                const id = document.createElement("td");
                id.textContent = curso.id;

                const titulo = document.createElement("td");
                titulo.textContent = curso.titulo || "—";

                const descricao = document.createElement("td");
                descricao.textContent = curso.descricao || "—";

                const acesso = document.createElement("td");
                acesso.textContent =
                    curso.exclusivo ? "Premium" : "Gratuito";

                const acoes = document.createElement("td");

                const editar = document.createElement("button");
                editar.type = "button";
                editar.className = "btn";
                editar.textContent = "Editar";
                editar.addEventListener("click", () => editarCurso(curso));

                const excluir = document.createElement("button");
                excluir.type = "button";
                excluir.className = "btn btn-sec";
                excluir.textContent = "Excluir";
                excluir.addEventListener("click", () => excluirCurso(curso.id));

                acoes.append(editar, excluir);
                linha.append(id, titulo, descricao, acesso, acoes);

                tabela.appendChild(linha);
            });

        } catch (erro) {
            console.error("Erro ao buscar cursos:", erro);

            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="vazio">
                        Não foi possível carregar os cursos.
                    </td>
                </tr>
            `;

            mensagem.textContent =
                "Erro ao consultar o backend: " + erro.message;
        }
    }

    function abrirModal() {
        modal.classList.add("ativo");
    }

    function fecharModal() {
        modal.classList.remove("ativo");
        formulario.reset();

        document.getElementById("cursoId").value = "";
        document.getElementById("tituloModalCurso").textContent =
            "Novo curso";
    }

    function editarCurso(curso) {
        document.getElementById("cursoId").value = curso.id;
        document.getElementById("tituloCurso").value = curso.titulo || "";
        document.getElementById("descricaoCurso").value =
            curso.descricao || "";
        document.getElementById("conteudoCurso").value =
            curso.conteudo || "";

        document.getElementById("exclusivoCurso").value =
            String(Boolean(curso.exclusivo));

        document.getElementById("tituloModalCurso").textContent =
            "Editar curso";

        abrirModal();
    }

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        const id = document.getElementById("cursoId").value;

        const dados = {
            titulo: document.getElementById("tituloCurso").value.trim(),
            descricao: document.getElementById("descricaoCurso").value.trim(),
            conteudo: document.getElementById("conteudoCurso").value.trim(),
            exclusivo:
                document.getElementById("exclusivoCurso").value === "true"
        };

        if (!dados.titulo) {
            mensagem.textContent = "Informe o título do curso.";
            return;
        }

        try {
            if (id) {
                await EducaAPI.put(`/cursos/atualizar/${id}`, dados);
                mensagem.textContent = "Curso atualizado com sucesso.";
            } else {
                await EducaAPI.post("/cursos/cadastrar", dados);
                mensagem.textContent = "Curso cadastrado com sucesso.";
            }

            fecharModal();
            await carregarCursos();

        } catch (erro) {
            console.error("Erro ao salvar curso:", erro);
            mensagem.textContent =
                "Não foi possível salvar o curso: " + erro.message;
        }
    });

    async function excluirCurso(id) {
        if (!confirm("Deseja realmente excluir este curso?")) {
            return;
        }

        try {
            await EducaAPI.delete(`/cursos/excluir/${id}`);

            mensagem.textContent = "Curso excluído com sucesso.";

            await carregarCursos();

        } catch (erro) {
            console.error("Erro ao excluir curso:", erro);
            mensagem.textContent =
                "Não foi possível excluir o curso: " + erro.message;
        }
    }

    document.getElementById("novoCurso").addEventListener("click", () => {
        fecharModal();
        abrirModal();
    });

    document.getElementById("fecharModalCurso")
        .addEventListener("click", fecharModal);

    document.getElementById("cancelarCurso")
        .addEventListener("click", fecharModal);

    document.getElementById("sair").addEventListener("click", () => {
        encerrarSessao();
        window.location.href = "../login.html";
    });
    carregarCursos();

});

