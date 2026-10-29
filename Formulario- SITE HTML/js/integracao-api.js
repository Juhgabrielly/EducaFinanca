/*
 Integração das páginas antigas com a API. A API é a fonte oficial dos dados;
 localStorage é usado apenas como cache para manter compatibilidade com a interface existente.
*/
(function () {
  if (window.__educaIntegracaoIniciada) return;
  window.__educaIntegracaoIniciada = true;

  const originalSet = localStorage.setItem.bind(localStorage);
  const originalGet = localStorage.getItem.bind(localStorage);
  let sincronizando = false;
  let bases = { investimentos: [], metas: [] };
  const rotas = {
    investimentos: "/investimentos",
    metas: "/metas",
    reserva: "/reservasEmergencia"
  };

  function usuario() {
    try { return JSON.parse(originalGet("usuario")); } catch { return null; }
  }
  function chamada(caminho, metodo, corpo) {
    const opcoes = { method: metodo };
    if (corpo !== undefined) opcoes.body = JSON.stringify(corpo);
    return requisicaoAPI(caminho, opcoes);
  }
  function numero(valor) { return Number(valor || 0); }
  function tipoId(tipo) {
    const lista = window.__tiposInvestimento || [];
    const encontrado = lista.find(item => (item.nome || "").toLowerCase() === String(tipo || "").toLowerCase());
    return encontrado ? encontrado.id : (lista[0] ? lista[0].id : null);
  }

  async function sincronizarLista(chave, listaNova) {
    if (sincronizando || !Array.isArray(listaNova) || !obterToken()) return;
    const usuarioAtual = usuario();
    if (!usuarioAtual || !usuarioAtual.id) return;

    const baseAnterior = bases[chave] || [];
    const rota = rotas[chave];
    const convertidos = [];
    for (const item of listaNova) {
      const idRemoto = item.idRemoto || (baseAnterior.find(anterior => String(anterior.id) === String(item.id)) || {}).idRemoto;
      try {
        let resposta;
        if (chave === "metas") {
          const corpo = {
            nome: item.nome,
            valor_meta: numero(item.valorMeta ?? item.valor_meta),
            valor_atual: numero(item.valorAtual ?? item.valor_atual)
          };
          resposta = idRemoto
            ? await chamada(`${rota}/atualizar/${idRemoto}`, "PUT", corpo)
            : await chamada(`${rota}/cadastrar`, "POST", corpo);
          convertidos.push({ ...item, id: resposta.id, idRemoto: resposta.id });
        } else {
          const idTipo = tipoId(item.tipo);
          if (!idTipo) {
            console.warn("Nenhum tipo de investimento cadastrado na API. Cadastre tipos antes de criar investimentos.");
            convertidos.push(item);
            continue;
          }
          const corpo = {
            tipo_investimento_id: idTipo,
            nome: item.nome,
            valor_investido: numero(item.valorAplicado ?? item.valor_investido),
            valor_atual: numero(item.valorAtual ?? item.valor_atual),
            rentabilidade: item.valorAplicado ? ((numero(item.valorAtual) - numero(item.valorAplicado)) / numero(item.valorAplicado)) * 100 : 0
          };
          resposta = idRemoto
            ? await chamada(`${rota}/atualizar/${idRemoto}`, "PUT", corpo)
            : await chamada(`${rota}/cadastrar`, "POST", corpo);
          convertidos.push({ ...item, id: resposta.id, idRemoto: resposta.id });
        }
      } catch (erro) {
        console.error(`Não foi possível salvar ${chave} na API:`, erro.message);
        convertidos.push(item);
      }
    }

    for (const anterior of baseAnterior) {
      const continua = listaNova.some(item => String(item.id) === String(anterior.id) || String(item.idRemoto) === String(anterior.idRemoto));
      if (!continua && anterior.idRemoto) {
        try { await chamada(`${rota}/excluir/${anterior.idRemoto}`, "DELETE"); }
        catch (erro) { console.error(`Não foi possível excluir ${chave} na API:`, erro.message); }
      }
    }

    bases[chave] = convertidos.map(item => ({ ...item }));
    sincronizando = true;
    originalSet(chave, JSON.stringify(convertidos));
    sincronizando = false;
  }

  const mapeado = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (chave, valor) {
    mapeado(chave, valor);
    if (sincronizando || !obterToken()) return;
    if (chave === "investimentos" || chave === "metas") {
      try { sincronizarLista(chave, JSON.parse(valor)); }
      catch (erro) { console.error(erro); }
    }
    if (chave === "reserva") sincronizarReserva(numero(valor));
    if (chave === "usuario") sincronizarPerfil(valor);
    if (chave === "usuario") sincronizarAssinatura(valor);
  };

  async function sincronizarReserva(valor) {
    if (sincronizando) return;
    const atual = usuario();
    if (!atual || !atual.id || !obterToken()) return;
    try {
      const lista = await chamada("/reservasEmergencia/listar", "GET");
      const existente = Array.isArray(lista) ? lista.find(item => Number(item.usuario_id) === Number(atual.id)) : null;
      if (existente) await chamada(`/reservasEmergencia/atualizar/${existente.id}`, "PUT", { valor });
      else await chamada("/reservasEmergencia/cadastrar", "POST", { valor });
    } catch (erro) { console.error("Não foi possível salvar a reserva na API:", erro.message); }
  }

  async function sincronizarPerfil(valor) {
    if (sincronizando || !obterToken()) return;
    let novo;
    try { novo = JSON.parse(valor); } catch { return; }
    const atual = usuario();
    if (!atual || !atual.id || Number(novo.id) !== Number(atual.id)) return;
    const corpo = { nome: novo.nome, telefone: novo.telefone, email: novo.email };
    try {
      const atualizado = await chamada(`/usuarios/atualizar/${atual.id}`, "PUT", corpo);
      const sessao = { ...atualizado, token: undefined };
      sincronizando = true;
      originalSet("usuario", JSON.stringify({ ...sessao, ...novo, id: atualizado.id, nome: atualizado.nome, telefone: atualizado.telefone, email: atualizado.email }));
      sincronizando = false;
    } catch (erro) { console.error("Não foi possível atualizar o perfil na API:", erro.message); }
  }

  let planoSincronizado = null;
  async function sincronizarAssinatura(valor) {
    if (sincronizando || !obterToken()) return;
    let novo;
    try { novo = JSON.parse(valor); } catch { return; }
    const anterior = usuario();
    const plano = novo.plano;
    if (!plano || plano === planoSincronizado) return;
    planoSincronizado = plano;
    try {
      const assinaturas = await chamada('/assinaturas/listar', 'GET');
      const ativas = Array.isArray(assinaturas) ? assinaturas.filter(item => item.status === 'ATIVA') : [];
      if (plano === 'PREMIUM' && !ativas.some(item => item.plano === 'PREMIUM')) {
        await chamada('/assinaturas/cadastrar', 'POST', { plano: 'PREMIUM' });
      } else if (plano === 'FREE') {
        const premiumAtiva = ativas.find(item => item.plano === 'PREMIUM');
        if (premiumAtiva) await chamada(`/assinaturas/atualizar/${premiumAtiva.id}`, 'PUT', { status: 'CANCELADA' });
      }
    } catch (erro) {
      planoSincronizado = null;
      console.error('Não foi possível sincronizar a assinatura:', erro.message);
    }
  }

  async function carregarDadosDaAPI() {
    if (!obterToken()) return;
    const atual = usuario();
    if (!atual) return;

    // Confere a sessão com dados reais e protege páginas internas.
    const caminho = location.pathname.toLowerCase();
    const paginasPublicas = ["login.html", "cadastro.html", "index.html"];
    if (!paginasPublicas.some(nome => caminho.endsWith(nome)) && !atual.id) {
      alert("Entre novamente para acessar sua conta.");
      encerrarSessao();
      location.href = "login.html";
      return;
    }

    try {
      const tipos = await chamada("/tiposInvestimento/listar", "GET");
      window.__tiposInvestimento = Array.isArray(tipos) ? tipos : [];
    } catch (erro) { console.warn("Tipos de investimento:", erro.message); }

    for (const chave of ["metas", "investimentos"]) {
      try {
        const resposta = await chamada(`${rotas[chave]}/listar`, "GET");
        const lista = (Array.isArray(resposta) ? resposta : []).map(item => {
          if (chave === "metas") return {
            id: item.id, idRemoto: item.id, nome: item.nome,
            valorMeta: numero(item.valor_meta), valorAtual: numero(item.valor_atual)
          };
          const tipo = (window.__tiposInvestimento || []).find(t => Number(t.id) === Number(item.tipo_investimento_id));
          return {
            id: item.id, idRemoto: item.id, nome: item.nome,
            tipo: tipo ? tipo.nome : "Renda fixa",
            valorAplicado: numero(item.valor_investido), valorAtual: numero(item.valor_atual),
            meses: 1
          };
        });
        bases[chave] = lista.map(item => ({ ...item }));
        sincronizando = true;
        originalSet(chave, JSON.stringify(lista));
        sincronizando = false;
      } catch (erro) { console.warn(`Não foi possível carregar ${chave}:`, erro.message); }
    }

    try {
      const reservas = await chamada("/reservasEmergencia/listar", "GET");
      const reserva = Array.isArray(reservas) ? reservas.find(item => Number(item.usuario_id) === Number(atual.id)) : null;
      if (reserva) originalSet("reserva", String(numero(reserva.valor)));
    } catch (erro) { console.warn("Não foi possível carregar reserva:", erro.message); }

    // Atualiza telas que renderizam os dados ao abrir.
    ["mostrarInvestimentos", "mostrarMetas", "mostrarReserva", "atualizarPatrimonio"].forEach(nome => {
      if (typeof window[nome] === "function") {
        try { window[nome](); } catch (erro) { console.warn(erro); }
      }
    });

    // Carrega progresso e resultados do usuário a partir do banco.
    try {
      window.__progressoCursos = await chamada('/progressoCursos/listar', 'GET');
      window.__resultadosQuizzes = await chamada('/resultadosQuiz/listar', 'GET');
      const cursosConcluidos = window.__progressoCursos.filter(item => item.concluido === true || Number(item.progresso) >= 100).length;
      const contadorCursos = document.getElementById('cursosConcluidos');
      if (contadorCursos) contadorCursos.textContent = `${cursosConcluidos} ${cursosConcluidos === 1 ? 'Curso concluído' : 'Cursos concluídos'}`;
    } catch (erro) { console.warn('Progresso/resultados:', erro.message); }

  }

  document.addEventListener("DOMContentLoaded", () => {
    carregarDadosDaAPI();
    // Logout consistente em todas as páginas.
    const sair = document.getElementById("logoutBtn") || document.getElementById("sair");
    if (sair) sair.addEventListener("click", () => { encerrarSessao(); location.href = "login.html"; });
  });
})();
