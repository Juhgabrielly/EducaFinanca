const formularioLogin = document.getElementById("formLogin");
const mensagemLogin = document.getElementById("mensagem");
const botaoEntrar = document.getElementById("botaoEntrar");

formularioLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemLogin.textContent = "";
  botaoEntrar.disabled = true;
  botaoEntrar.textContent = "Entrando...";

  try {
    const dados = await requisicaoAPI("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value
      })
    });

    salvarSessao(dados.token, dados.usuario);
    window.location.href = "home.html";
  } catch (erro) {
    mensagemLogin.textContent = erro.message;
  } finally {
    botaoEntrar.disabled = false;
    botaoEntrar.textContent = "Entrar";
  }
});
