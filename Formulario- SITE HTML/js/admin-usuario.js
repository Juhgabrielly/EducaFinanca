let usuarios = [];

const usuarioLogado = obterUsuario();

if (!usuarioLogado) {
    window.location.href = "../login.html";
}

const nomeAdmin = document.getElementById("nomeAdmin");

if (usuarioLogado && nomeAdmin) {
    nomeAdmin.textContent =
        usuarioLogado.nome ||
        usuarioLogado.email ||
        "Administrador";
}

async function carregarUsuarios() {
    try {
        const resposta = await requisicaoAPI("/usuarios/listar");

        // TESTE DA RESPOSTA DA API
        console.log("RESPOSTA DA API:", resposta);
        console.log("TOKEN EXISTE:", !!obterToken());

        usuarios = Array.isArray(resposta)
            ? resposta
            : Array.isArray(resposta.usuarios)
                ? resposta.usuarios
                : [];

        // TESTE DOS USUÁRIOS RECEBIDOS
        console.log("USUÁRIOS RECEBIDOS:", usuarios);

        atualizarCards();
        mostrarUsuarios(usuarios);

    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);

        document.getElementById("tabelaUsuarios").innerHTML = `
            <tr>
                <td colspan="6">
                    Não foi possível carregar os usuários.
                </td>
            </tr>
        `;
    }
}

function atualizarCards() {
    const total = usuarios.length;

    const premium = usuarios.filter(
        item => item.plano === "PREMIUM"
    ).length;

    const free = usuarios.filter(
        item => item.plano === "FREE"
    ).length;

    document.getElementById("totalUsuarios").textContent = total;
    document.getElementById("totalPremium").textContent = premium;
    document.getElementById("totalFree").textContent = free;
}

function mostrarUsuarios(lista) {
    const tabela = document.getElementById("tabelaUsuarios");

    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhum usuário encontrado.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(usuario => {
        const linha = document.createElement("tr");

        const plano = usuario.plano || "FREE";
        const tipo = usuario.tipo || "USUARIO";

        linha.innerHTML = `
            <td>#${usuario.id}</td>

            <td>
                <div class="usuario-tabela">
                    <div class="avatar-admin">
                        ${usuario.nome
                            ? usuario.nome.charAt(0).toUpperCase()
                            : "U"}
                    </div>

                    <div>
                        <strong>${usuario.nome || "Usuário"}</strong>
                    </div>
                </div>
            </td>

            <td>${usuario.email || "-"}</td>

            <td>
                <span class="badge-plano ${plano === "PREMIUM" ? "premium" : "free"}">
                    ${plano === "PREMIUM" ? "⭐ PREMIUM" : "FREE"}
                </span>
            </td>

            <td>
                <span class="badge-tipo">${tipo}</span>
            </td>

            <td>
                <div class="acoes-admin">

                    <button
                        class="btn-ver"
                        onclick="verUsuario(${Number(usuario.id)})"
                        title="Ver usuário"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    ${tipo !== "ADMIN"
                        ? plano === "PREMIUM"
                            ? `
                                <button
                                    class="btn-remover-premium"
                                    onclick="alterarPlano(${Number(usuario.id)}, 'FREE')"
                                >
                                    Remover Premium
                                </button>
                            `
                            : `
                                <button
                                    class="btn-premium"
                                    onclick="alterarPlano(${Number(usuario.id)}, 'PREMIUM')"
                                >
                                    Tornar Premium
                                </button>
                            `
                        : `
                            <span class="admin-protegido">
                                Administrador
                            </span>
                        `
                    }

                </div>
            </td>
        `;

        tabela.appendChild(linha);
    });
}

document.getElementById("pesquisarUsuario").addEventListener(
    "input",
    event => {
        const pesquisa = event.target.value.toLowerCase().trim();

        const filtrados = usuarios.filter(usuario => {
            const nome = usuario.nome?.toLowerCase() || "";
            const email = usuario.email?.toLowerCase() || "";

            return nome.includes(pesquisa) || email.includes(pesquisa);
        });

        mostrarUsuarios(filtrados);
    }
);

async function alterarPlano(id, novoPlano) {
    const mensagem = novoPlano === "PREMIUM"
        ? "Deseja tornar este usuário Premium?"
        : "Deseja remover o Premium deste usuário?";

    const confirmar = confirm(mensagem);

    if (!confirmar) {
        return;
    }

    try {
        await requisicaoAPI(`/usuarios/atualizar/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                plano: novoPlano
            })
        });

        alert(
            novoPlano === "PREMIUM"
                ? "Premium ativado!"
                : "Premium removido."
        );

        await carregarUsuarios();

    } catch (erro) {
        console.error("Erro ao alterar plano:", erro);

        alert("Não foi possível alterar o plano: " + erro.message);
    }
}

function verUsuario(id) {
    const usuario = usuarios.find(
        item => Number(item.id) === Number(id)
    );

    if (!usuario) {
        return;
    }

    const detalhes = document.getElementById("detalhesUsuario");

    detalhes.innerHTML = `
        <div class="detalhe-linha">
            <span>Nome</span>
            <strong>${usuario.nome || "-"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>E-mail</span>
            <strong>${usuario.email || "-"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>Telefone</span>
            <strong>${usuario.telefone || "-"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>Cidade</span>
            <strong>${usuario.cidade || "-"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>Área de interesse</span>
            <strong>${usuario.areaInteresse || "-"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>Plano</span>
            <strong>${usuario.plano || "FREE"}</strong>
        </div>

        <div class="detalhe-linha">
            <span>Tipo</span>
            <strong>${usuario.tipo || "USUARIO"}</strong>
        </div>
    `;

    document.getElementById("modalUsuario").style.display = "flex";
}

document.getElementById("fecharModal").addEventListener(
    "click",
    () => {
        document.getElementById("modalUsuario").style.display = "none";
    }
);

document.getElementById("sair").addEventListener(
    "click",
    () => {
        encerrarSessao();
        window.location.href = "../login.html";
    }
);

if (usuarioLogado) {
    carregarUsuarios();
}
