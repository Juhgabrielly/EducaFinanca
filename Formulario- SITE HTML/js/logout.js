document.addEventListener("DOMContentLoaded", () => {
  const botaoSair = document.getElementById("logoutBtn");
  if (!botaoSair) return;

  botaoSair.addEventListener("click", () => {
    const confirmar = confirm("Deseja realmente sair da sua conta?");
    if (!confirmar) return;

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
});
