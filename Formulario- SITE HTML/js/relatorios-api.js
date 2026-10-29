document.addEventListener('DOMContentLoaded', async () => {
  const formulario = document.getElementById('formMovimentacao');
  const lista = document.getElementById('listaMovimentacoes');
  const mensagem = document.getElementById('mensagemMovimentacao');
  const receitaInput = document.getElementById('receitaInput');
  const despesaInput = document.getElementById('despesaInput');
  const saldoAtual = document.getElementById('saldoAtual');
  const tabela = document.getElementById('tabelaFinanceira');
  const filtroMes = document.getElementById('filtroMes');
  const filtroAno = document.getElementById('filtroAno');
  const cardCadastro = document.getElementById('cardCadastro');
  const cardRegistros = document.getElementById('cardRegistros');
  const abrirCadastro = document.getElementById('abrirCadastro');
  const alternarRegistros = document.getElementById('alternarRegistros');
  const usuarioSessao = obterUsuario();
  const ehAdmin = usuarioSessao && usuarioSessao.tipo === 'ADMIN';
  if (!formulario || !lista || !mensagem || !receitaInput || !despesaInput || !saldoAtual || !tabela || !filtroMes || !filtroAno) return;
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  let movimentacoes = [];
  let editandoId = null;
  if (!obterToken()) {
    lista.innerHTML = '<tr><td colspan="5">Entre na sua conta para consultar movimentações.</td></tr>';
    mensagem.innerHTML = 'Faça <a href="login.html">login</a> para cadastrar receitas e despesas.';
    return;
  }
  const hoje = new Date();
  const dataInput = document.getElementById('movData');
  const dataHoje = () => `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
  dataInput.value = dataHoje();
  abrirCadastro.addEventListener('click', () => {
    const vaiAbrir = cardCadastro.style.display === 'none';
    cardCadastro.style.display = vaiAbrir ? 'block' : 'none';
    if (vaiAbrir) { cardCadastro.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('movDescricao').focus(); }
  });
  alternarRegistros.addEventListener('click', () => {
    const vaiAbrir = cardRegistros.style.display === 'none';
    cardRegistros.style.display = vaiAbrir ? 'block' : 'none';
    alternarRegistros.setAttribute('aria-expanded', String(vaiAbrir));
    alternarRegistros.innerHTML = vaiAbrir ? '<i class="fa-solid fa-eye-slash"></i> Ocultar receitas e despesas' : '<i class="fa-solid fa-list"></i> Ver receitas e despesas';
    if (vaiAbrir) cardRegistros.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  if (ehAdmin) document.querySelectorAll('.coluna-usuario').forEach(coluna => coluna.hidden = false);
  // Selects the current year by default and adds new years as the calendar moves forward.
  const anoAtual = String(hoje.getFullYear());
  if (![...filtroAno.options].some(opcao => opcao.value === anoAtual)) filtroAno.add(new Option(anoAtual, anoAtual));
  filtroAno.value = anoAtual;
  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    const valor = Number(document.getElementById('movValor').value);
    if (!Number.isFinite(valor) || valor <= 0) { mensagem.textContent = 'Informe um valor maior que zero.'; return; }
    const corpo = { tipo: document.getElementById('movTipo').value, descricao: document.getElementById('movDescricao').value.trim(), valor, data_movimentacao: dataInput.value };
    const botao = document.getElementById('salvarMovimentacao');
    botao.disabled = true;
    try {
      if (editandoId) await EducaAPI.put(`/movimentacoes/atualizar/${editandoId}`, corpo);
      else await EducaAPI.post('/movimentacoes/cadastrar', corpo);
      mensagem.textContent = editandoId ? 'Movimentação atualizada no banco de dados.' : 'Movimentação salva no banco de dados.';
      editandoId = null; formulario.reset(); botao.textContent = 'Adicionar movimentação'; document.getElementById('tituloFormulario').textContent = 'Cadastrar movimentação'; dataInput.value = dataHoje();
      await carregar();
    } catch (erro) { mensagem.textContent = `Não foi possível salvar: ${erro.message}`; }
    finally { botao.disabled = false; }
  });
  async function carregar() {
    try {
      const resposta = await EducaAPI.get('/movimentacoes/listar');
      movimentacoes = Array.isArray(resposta) ? resposta : [];
      renderizarMovimentacoes(); renderizarResumo();
    } catch (erro) {
      lista.innerHTML = `<tr><td colspan="5">${escapar(erro.message)}</td></tr>`;
      mensagem.textContent = `Erro ao carregar movimentações: ${erro.message}`;
    }
  }
  function renderizarMovimentacoes() {
    if (!movimentacoes.length) { lista.innerHTML = `<tr><td colspan="${ehAdmin ? 6 : 5}">Nenhuma movimentação cadastrada.</td></tr>`; return; }
    lista.innerHTML = movimentacoes.slice().sort((a,b) => new Date(b.data_movimentacao)-new Date(a.data_movimentacao)).map(item => `<tr><td>${formatarData(item.data_movimentacao)}</td><td>${item.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}</td><td>${escapar(item.descricao || '')}</td><td>${dinheiro(item.valor)}</td>${ehAdmin ? `<td>${escapar(item.usuario?.nome || `Usuário #${item.usuario_id}`)}<br><small>${escapar(item.usuario?.email || '')}</small></td>` : ''}<td><button type="button" data-editar="${item.id}">Editar</button> <button type="button" data-excluir="${item.id}">Excluir</button></td></tr>`).join('');
    lista.querySelectorAll('[data-editar]').forEach(botao => botao.addEventListener('click', () => {
      const item = movimentacoes.find(registro => Number(registro.id) === Number(botao.dataset.editar)); if (!item) return;
      editandoId = item.id; cardCadastro.style.display = 'block'; document.getElementById('tituloFormulario').textContent = 'Editar movimentação'; document.getElementById('movTipo').value = item.tipo; document.getElementById('movDescricao').value = item.descricao || ''; document.getElementById('movValor').value = Number(item.valor); dataInput.value = String(item.data_movimentacao).slice(0,10); document.getElementById('salvarMovimentacao').textContent = 'Salvar alterações'; formulario.scrollIntoView({ behavior: 'smooth' });
    }));
    lista.querySelectorAll('[data-excluir]').forEach(botao => botao.addEventListener('click', async () => {
      if (!confirm('Deseja excluir esta movimentação do banco?')) return;
      botao.disabled = true;
      try { await EducaAPI.delete(`/movimentacoes/excluir/${botao.dataset.excluir}`); mensagem.textContent = 'Movimentação excluída do banco.'; await carregar(); }
      catch (erro) { mensagem.textContent = `Não foi possível excluir: ${erro.message}`; botao.disabled = false; }
    }));
  }
  function renderizarResumo() {
    const ano = Number(filtroAno.value || hoje.getFullYear()); const mes = filtroMes.value;
    const somas = {};
    movimentacoes.forEach(item => {
      const texto = String(item.data_movimentacao).slice(0,10);
      const partes = texto.split('-'); if (partes.length !== 3) return;
      const data = new Date(Number(partes[0]), Number(partes[1])-1, Number(partes[2]));
      const chave = `${meses[data.getMonth()]}-${data.getFullYear()}`;
      if (!somas[chave]) somas[chave] = { receita:0, despesa:0 };
      if (item.tipo === 'RECEITA') somas[chave].receita += Number(item.valor || 0);
      if (item.tipo === 'DESPESA') somas[chave].despesa += Number(item.valor || 0);
    });
    const registroAtual = somas[`${meses[hoje.getMonth()]}-${hoje.getFullYear()}`] || { receita:0, despesa:0 };
    receitaInput.value = registroAtual.receita.toFixed(2); despesaInput.value = registroAtual.despesa.toFixed(2); receitaInput.readOnly = true; despesaInput.readOnly = true;
    saldoAtual.textContent = dinheiro(registroAtual.receita - registroAtual.despesa); saldoAtual.classList.toggle('negative', registroAtual.receita < registroAtual.despesa);
    tabela.innerHTML = '';
    meses.forEach((nomeMes, indice) => {
      if (mes !== 'todos' && mes !== nomeMes) return;
      const reg = somas[`${nomeMes}-${ano}`] || { receita:0, despesa:0 }; const saldo = reg.receita-reg.despesa;
      const linha = document.createElement('tr'); linha.innerHTML = `<td>${nomes[indice]}</td><td class="valor-receita">${dinheiro(reg.receita)}</td><td class="valor-despesa">${dinheiro(reg.despesa)}</td><td class="${saldo>=0?'positive':'negative'}">${dinheiro(saldo)}</td>`; tabela.appendChild(linha);
    });
  }
  function dinheiro(valor) { return Number(valor || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function formatarData(valor) { const texto=String(valor).slice(0,10); const partes=texto.split('-'); return partes.length===3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : texto; }
  function escapar(valor) { return String(valor ?? '').replace(/[&<>"']/g, caractere => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caractere])); }
  filtroMes.addEventListener('change', renderizarResumo); filtroAno.addEventListener('change', renderizarResumo);
  await carregar();
});
