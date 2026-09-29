const API = "http://localhost:3000";

const usuario = JSON.parse(
    localStorage.getItem("usuario")
);

// Se não estiver logado
if (!usuario) {
    window.location.href = "../login.html";
}


// ==============================
// CARREGAR DASHBOARD
// ==============================

async function carregarDashboard() {

    try {

        const resposta = await fetch(
            `${API}/usuarios`
        );

        const usuarios =
            await resposta.json();


        document.getElementById(
            "totalUsuarios"
        ).textContent =
            usuarios.length;


        const premium =
            usuarios.filter(
                usuario =>
                    usuario.plano === "PREMIUM"
            );


        document.getElementById(
            "totalPremium"
        ).textContent =
            premium.length;


        const tabela =
            document.getElementById(
                "tabelaUsuarios"
            );


        tabela.innerHTML = "";


        usuarios
            .slice(0, 5)
            .forEach(usuario => {

                const linha =
                    document.createElement("tr");


                linha.innerHTML = `
                    <td>${usuario.nome}</td>

                    <td>${usuario.email}</td>

                    <td>
                        ${usuario.plano}
                    </td>

                    <td>
                        ${usuario.tipo}
                    </td>
                `;


                tabela.appendChild(linha);

            });


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


carregarDashboard();


// ==============================
// SAIR
// ==============================

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