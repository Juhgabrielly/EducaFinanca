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
    try {
      return JSON.parse(originalGet("usuario"));
    } catch {
      return null;
    }
  }

  function chamada(caminho, metodo, corpo) {
    const opcoes = { method: metodo };

    if (corpo !== undefined) {
      opcoes.body = JSON.stringify(corpo);
    }

    return requisicaoAPI(caminho, opcoes);
  }

  function numero(valor) {
    return Number(valor || 0);
  }

  function tipoId(tipo) {
    const lista = window.__tiposInvestimento || [];

    const encontrado = lista.find(item =>
      (item.nome || "").toLowerCase() === String(tipo || "").toLowerCase()
    );

    return encontrado
      ? encontrado.id
      : (lista[0] ? lista[0].id : null);
  }

  // Recupera o ID presente no token JWT.
  function obterIdDoToken() {
    try {
      const token = obterToken();

      if (!token) return null;

      const partes = token.split(".");

      if (partes.length !== 3) return null;

      const payload = partes[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const preenchido = payload.padEnd(
        payload.length + (4 - payload.length % 4) % 4,
        "="
      );

      const decodificado = decodeURIComponent(
        Array.from(atob(preenchido))
          .map(letra =>
            "%" + letra.charCodeAt(0).toString(16).padStart(2, "0")
          )
          .join("")
      );

      const dados = JSON.parse(decodificado);

      return dados.id || null;

    } catch (erro) {
      console.warn("Não foi possível identificar o usuário pelo token.");
      return null;
    }
  }

  // Recupera os dados do usuário diretamente do backend.
  async function recuperarUsuario() {
    const atual = usuario();

    if (atual && atual.id) {
      return atual;
    }

    const id = obterIdDoToken();

    if (!id) {
      return null;
    }

    try {
      const resposta = await chamada(
        `/usuarios/buscar/${id}`,
        "GET"
      );

      const dadosUsuario = resposta.usuario || resposta;

      if (!dadosUsuario || !dadosUsuario.id) {
        return null;
      }

      originalSet("usuario", JSON.stringify(dadosUsuario));

      return dadosUsuario;

    } catch (erro) {
      console.error(
        "Não foi possível recuperar os dados da conta:",
        erro.message
      );

      return null;
    }
  }

  function redirecionarLogin() {
    const estaNoAdmin = location.pathname.toLowerCase().includes("/admin/");

    location.href = estaNoAdmin
      ? "../login.html"
      : "login.html";
  }

  function salvarCache(chave, valor) {
    sincronizando = true;

    try {
      originalSet(chave, valor);
    } finally {
      sincronizando = false;
    }
  }

  async function sincronizarLista(chave, listaNova) {
    if (sincronizando || !Array.isArray(listaNova) || !obterToken()) return;

    const usuarioAtual = usuario();

    if (!usuarioAtual || !usuarioAtual.id) return;

    const baseAnterior = bases[chave] || [];
    const rota = rotas[chave];
    const convertidos = [];

    for (const item of listaNova) {
      const idRemoto = item.idRemoto ||
        (baseAnterior.find(anterior =>
          String(anterior.id) === String(item.id)
        ) || {}).idRemoto;

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

          const dados = resposta.meta || resposta;

          convertidos.push({
            ...item,
            id: dados.id || idRemoto || item.id,
            idRemoto: dados.id || idRemoto || item.idRemoto
          });

        } else {
          const idTipo = tipoId(item.tipo);

          if (!idTipo) {
            console.warn(
              "Nenhum tipo de investimento cadastrado na API."
            );

            convertidos.push(item);
            continue;
          }

          const valorAplicado = numero(
            item.valorAplicado ?? item.valor_investido
          );

          const valorAtual = numero(
            item.valorAtual ?? item.valor_atual
          );

          const corpo = {
            tipo_investimento_id: idTipo,
            nome: item.nome,
            valor_investido: valorAplicado,
            valor_atual: valorAtual,
            rentabilidade: valorAplicado
              ? ((valorAtual - valorAplicado) / valorAplicado) * 100
              : 0
          };

          resposta = idRemoto
            ? await chamada(`${rota}/atualizar/${idRemoto}`, "PUT", corpo)
            : await chamada(`${rota}/cadastrar`, "POST", corpo);

          const dados = resposta.investimento || resposta;

          convertidos.push({
            ...item,
            id: dados.id || idRemoto || item.id,
            idRemoto: dados.id || idRemoto || item.idRemoto
          });
        }

      } catch (erro) {
        console.error(
          `Não foi possível salvar ${chave} na API:`,
          erro.message
        );

        convertidos.push(item);
      }
    }

    for (const anterior of baseAnterior) {
      const continua = listaNova.some(item =>
        String(item.id) === String(anterior.id) ||
        String(item.idRemoto) === String(anterior.idRemoto)
      );

      if (!continua && anterior.idRemoto) {
        try {
          await chamada(
            `${rota}/excluir/${anterior.idRemoto}`,
            "DELETE"
          );
        } catch (erro) {
          console.error(
            `Não foi possível excluir ${chave} na API:`,
            erro.message
          );
        }
      }
    }

    bases[chave] = convertidos.map(item => ({ ...item }));

    salvarCache(chave, JSON.stringify(convertidos));
  }

  const mapeado = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function (chave, valor) {
    mapeado(chave, valor);

    if (sincronizando || !obterToken()) return;

    if (chave === "investimentos" || chave === "metas") {
      try {
        sincronizarLista(chave, JSON.parse(valor));
      } catch (erro) {
        console.error(erro);
      }
    }

    if (chave === "reserva") {
      sincronizarReserva(numero(valor));
    }

    if (chave === "usuario") {
      sincronizarPerfil(valor);
      sincronizarAssinatura(valor);
    }
  };

  async function sincronizarReserva(valor) {
    if (sincronizando || !obterToken()) return;

    const atual = usuario();

    if (!atual || !atual.id) return;

    try {
      const lista = await chamada(
        "/reservasEmergencia/listar",
        "GET"
      );

      const existente = Array.isArray(lista)
        ? lista.find(item =>
            Number(item.usuario_id) === Number(atual.id)
          )
        : null;

      if (existente) {
        await chamada(
          `/reservasEmergencia/atualizar/${existente.id}`,
          "PUT",
          { valor }
        );
      } else {
        await chamada(
          "/reservasEmergencia/cadastrar",
          "POST",
          { valor }
        );
      }

    } catch (erro) {
      console.error(
        "Não foi possível salvar a reserva na API:",
        erro.message
      );
    }
  }

  async function sincronizarPerfil(valor) {
    if (sincronizando || !obterToken()) return;

    let novo;

    try {
      novo = JSON.parse(valor);
    } catch {
      return;
    }

    const atual = usuario();

    if (
      !atual ||
      !atual.id ||
      Number(novo.id) !== Number(atual.id)
    ) {
      return;
    }

    const corpo = {
      nome: novo.nome,
      telefone: novo.telefone,
      email: novo.email
    };

    try {
      const atualizado = await chamada(
        `/usuarios/atualizar/${atual.id}`,
        "PUT",
        corpo
      );

      const dados = atualizado.usuario || atualizado;

      if (!dados.id) return;

      const sessao = {
        ...atual,
        ...novo,
        id: dados.id,
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        tipo: dados.tipo || atual.tipo,
        plano: dados.plano || atual.plano,
        status: dados.status ?? atual.status
      };

      salvarCache("usuario", JSON.stringify(sessao));

    } catch (erro) {
      console.error(
        "Não foi possível atualizar o perfil na API:",
        erro.message
      );
    }
  }

  let planoSincronizado = null;

  async function sincronizarAssinatura(valor) {
    if (sincronizando || !obterToken()) return;

    let novo;

    try {
      novo = JSON.parse(valor);
    } catch {
      return;
    }

    const plano = novo.plano;

    if (!plano || plano === planoSincronizado) return;

    planoSincronizado = plano;

    try {
      const assinaturas = await chamada(
        "/assinaturas/listar",
        "GET"
      );

      const ativas = Array.isArray(assinaturas)
        ? assinaturas.filter(item => item.status === "ATIVA")
        : [];

      if (
        plano === "PREMIUM" &&
        !ativas.some(item => item.plano === "PREMIUM")
      ) {
        await chamada(
          "/assinaturas/cadastrar",
          "POST",
          { plano: "PREMIUM" }
        );

      } else if (plano === "FREE") {
        const premiumAtiva = ativas.find(
          item => item.plano === "PREMIUM"
        );

        if (premiumAtiva) {
          await chamada(
            `/assinaturas/atualizar/${premiumAtiva.id}`,
            "PUT",
            { status: "CANCELADA" }
          );
        }
      }

    } catch (erro) {
      planoSincronizado = null;

      console.error(
        "Não foi possível sincronizar a assinatura:",
        erro.message
      );
    }
  }

  async function carregarDadosDaAPI() {
    if (!obterToken()) return;

    const atual = await recuperarUsuario();

    const caminho = location.pathname.toLowerCase();

    const paginasPublicas = [
      "login.html",
      "cadastro.html",
      "index.html"
    ];

    const paginaPublica = paginasPublicas.some(nome =>
      caminho.endsWith(nome)
    );

    if (!atual || !atual.id) {
      if (!paginaPublica) {
        alert("Não foi possível recuperar sua sessão. Entre novamente.");
        encerrarSessao();
        redirecionarLogin();
      }

      return;
    }

    try {
      const tipos = await chamada(
        "/tiposInvestimento/listar",
        "GET"
      );

      window.__tiposInvestimento = Array.isArray(tipos)
        ? tipos
        : [];

    } catch (erro) {
      console.warn("Tipos de investimento:", erro.message);
    }

    for (const chave of ["metas", "investimentos"]) {
      try {
        const resposta = await chamada(
          `${rotas[chave]}/listar`,
          "GET"
        );

        const lista = (Array.isArray(resposta) ? resposta : []).map(item => {
          if (chave === "metas") {
            return {
              id: item.id,
              idRemoto: item.id,
              nome: item.nome,
              valorMeta: numero(item.valor_meta),
              valorAtual: numero(item.valor_atual)
            };
          }

          const tipo = (window.__tiposInvestimento || []).find(
            t => Number(t.id) === Number(item.tipo_investimento_id)
          );

          return {
            id: item.id,
            idRemoto: item.id,
            nome: item.nome,
            tipo: tipo ? tipo.nome : "Renda fixa",
            valorAplicado: numero(item.valor_investido),
            valorAtual: numero(item.valor_atual),
            meses: 1
          };
        });

        bases[chave] = lista.map(item => ({ ...item }));

        salvarCache(chave, JSON.stringify(lista));

      } catch (erro) {
        console.warn(
          `Não foi possível carregar ${chave}:`,
          erro.message
        );
      }
    }

    try {
      const reservas = await chamada(
        "/reservasEmergencia/listar",
        "GET"
      );

      const reserva = Array.isArray(reservas)
        ? reservas.find(item =>
            Number(item.usuario_id) === Number(atual.id)
          )
        : null;

      if (reserva) {
        salvarCache("reserva", String(numero(reserva.valor)));
      }

    } catch (erro) {
      console.warn("Não foi possível carregar reserva:", erro.message);
    }

    [
      "mostrarInvestimentos",
      "mostrarMetas",
      "mostrarReserva",
      "atualizarPatrimonio"
    ].forEach(nome => {
      if (typeof window[nome] === "function") {
        try {
          window[nome]();
        } catch (erro) {
          console.warn(erro);
        }
      }
    });

    try {
      const progresso = await chamada(
        "/progressoCursos/listar",
        "GET"
      );

      const resultados = await chamada(
        "/resultadosQuiz/listar",
        "GET"
      );

      window.__progressoCursos = Array.isArray(progresso)
        ? progresso
        : [];

      window.__resultadosQuizzes = Array.isArray(resultados)
        ? resultados
        : [];

      const cursosConcluidos = window.__progressoCursos.filter(
        item =>
          item.concluido === true ||
          Number(item.progresso) >= 100
      ).length;

      const contadorCursos = document.getElementById(
        "cursosConcluidos"
      );

      if (contadorCursos) {
        contadorCursos.textContent =
          `${cursosConcluidos} ${
            cursosConcluidos === 1
              ? "Curso concluído"
              : "Cursos concluídos"
          }`;
      }

    } catch (erro) {
      console.warn(
        "Progresso/resultados:",
        erro.message
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    carregarDadosDaAPI();

    const sair =
      document.getElementById("logoutBtn") ||
      document.getElementById("sair");

    if (sair) {
      sair.addEventListener("click", () => {
        encerrarSessao();
        redirecionarLogin();
      });
    }
  });

})();
