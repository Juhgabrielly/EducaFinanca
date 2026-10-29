const formularioCadastro = document.getElementById("formCadastro");
const mensagemCadastro = document.getElementById("mensagem");
const botaoCadastrar = document.getElementById("botaoCadastrar");

formularioCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemCadastro.textContent = "";
  botaoCadastrar.disabled = true;
  botaoCadastrar.textContent = "Cadastrando...";

  try {
    await requisicaoAPI("/usuarios/cadastrar", {
      method: "POST",
      body: JSON.stringify({
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim() || null,
        senha: document.getElementById("senha").value
      })
    });

    alert("Conta criada com sucesso! Agora faça login.");
    window.location.href = "login.html";
  } catch (erro) {
    mensagemCadastro.textContent = erro.message;
  } finally {
    botaoCadastrar.disabled = false;
    botaoCadastrar.textContent = "Criar conta";
  }
});
