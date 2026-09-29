const API = "http://localhost:3000";

let usuarios = [];

const usuarioLogado =
    JSON.parse(
        localStorage.getItem("usuario")
    );


if (!usuarioLogado) {

    window.location.href =
        "../login.html";

}

const nomeAdmin =
    document.getElementById(
        "nomeAdmin"
    );


if (usuarioLogado) {

    nomeAdmin.textContent =
        usuarioLogado.nome ||
        usuarioLogado.email ||
        "Administrador";

}

async function carregarUsuarios() {

    try {

        const resposta =
            await fetch(
                `${API}/usuarios`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar usuários"
            );

        }


        usuarios =
            await resposta.json();


        atualizarCards();

        mostrarUsuarios(
            usuarios
        );


    } catch (erro) {

        console.error(
            "Erro:",
            erro
        );


        document.getElementById(
            "tabelaUsuarios"
        ).innerHTML = `

            <tr>

                <td colspan="6">

                    Não foi possível carregar os usuários.

                </td>

            </tr>

        `;

    }

}

function atualizarCards() {
    const total =
        usuarios.length;

    const premium =
        usuarios.filter(
            usuario =>
                usuario.plano ===
                "PREMIUM"
        ).length;

    const free =
        usuarios.filter(
            usuario =>
                usuario.plano ===
                "FREE"
        ).length;

    document.getElementById(
        "totalUsuarios"
    ).textContent =
        total;

    document.getElementById(
        "totalPremium"
    ).textContent =
        premium;

    document.getElementById(
        "totalFree"
    ).textContent =
        free;
}
function mostrarUsuarios(lista) {
    const tabela =
        document.getElementById(
            "tabelaUsuarios"
        );

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
        const linha =
            document.createElement(
                "tr"
            );
        const plano =
            usuario.plano ||
            "REE";
        const tipo =
            usuario.tipo ||
            "USUARIO";
        linha.innerHTML = `
            <td>
                #${usuario.id}
            </td>
            <td>
                <div class="usuario-tabela">
                    <div class="avatar-admin">
                        ${usuario.nome
                ? usuario.nome
                    .charAt(0)
                    .toUpperCase()
                : "U"
            }
                    </div>
                    <div>
                        <strong>
                            ${usuario.nome || "Usuário"}
                        </strong>

                    </div>
                </div>
            </td>
            <td>
                ${usuario.email}
            </td>

            <td>

                <span
                    class="badge-plano ${plano === "PREMIUM"
                ? "premium"
                : "free"
            }"
                >

                    ${plano === "PREMIUM"
                ? "⭐ PREMIUM"
                : "FREE"
            }

                </span>

            </td>


            <td>

                <span class="badge-tipo">

                    ${tipo}

                </span>

            </td>


            <td>

                <div class="acoes-admin">

                    <button
                        class="btn-ver"
                        onclick="verUsuario(${usuario.id})"
                        title="Ver usuário"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    ${tipo !== "ADMIN"
                ? plano === "PREMIUM"

                    ? `

                                    <button
                                        class="btn-remover-premium"
                                        onclick="alterarPlano(${usuario.id}, 'FREE')"
                                    >

                                        Remover Premium

                                    </button>

                                `

                    : `

                                    <button
                                        class="btn-premium"
                                        onclick="alterarPlano(${usuario.id}, 'PREMIUM')"
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


        tabela.appendChild(
            linha
        );

    });

}



document
    .getElementById(
        "pesquisarUsuario"
    )
    .addEventListener(
        "input",
        event => {

            const pesquisa =
                event.target.value
                    .toLowerCase()
                    .trim();


            const filtrados =
                usuarios.filter(
                    usuario => {

                        const nome =
                            usuario.nome
                                ?.toLowerCase() ||
                            "";


                        const email =
                            usuario.email
                                ?.toLowerCase() ||
                            "";


                        return (
                            nome.includes(
                                pesquisa
                            ) ||
                            email.includes(
                                pesquisa
                            )
                        );

                    }
                );


            mostrarUsuarios(
                filtrados
            );

        }
    );


async function alterarPlano(
    id,
    novoPlano
) {

    let mensagem;


    if (
        novoPlano ===
        "PREMIUM"
    ) {

        mensagem =
            "Deseja tornar este usuário Premium?";

    } else {

        mensagem =
            "Deseja remover o Premium deste usuário?";

    }


    const confirmar =
        confirm(mensagem);


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API}/usuarios/${id}/plano`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            plano:
                                novoPlano

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao alterar plano"
            );

        }


        alert(
            novoPlano === "PREMIUM"
                ? "⭐ Premium ativado!"
                : "Premium removido."
        );


        carregarUsuarios();


    } catch (erro) {

        console.error(
            erro
        );


        alert(
            "Não foi possível alterar o plano."
        );

    }

}


function verUsuario(id) {

    const usuario =
        usuarios.find(
            usuario =>
                usuario.id === id
        );


    if (!usuario) {

        return;

    }


    const detalhes =
        document.getElementById(
            "detalhesUsuario"
        );


    detalhes.innerHTML = `

        <div class="detalhe-linha">

            <span>Nome</span>

            <strong>
                ${usuario.nome || "-"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>E-mail</span>

            <strong>
                ${usuario.email || "-"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>Telefone</span>

            <strong>
                ${usuario.telefone || "-"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>Cidade</span>

            <strong>
                ${usuario.cidade || "-"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>Área de interesse</span>

            <strong>
                ${usuario.areaInteresse || "-"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>Plano</span>

            <strong>
                ${usuario.plano || "FREE"}
            </strong>

        </div>


        <div class="detalhe-linha">

            <span>Tipo</span>

            <strong>
                ${usuario.tipo || "USUARIO"}
            </strong>

        </div>

    `;


    document.getElementById(
        "modalUsuario"
    ).style.display =
        "flex";

}

document
    .getElementById(
        "fecharModal"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "modalUsuario"
            ).style.display =
                "none";

        }
    );
document
    .getElementById("sair")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "usuario"
            );


            window.location.href =
                "../login.html";

        }
    );
carregarUsuarios();