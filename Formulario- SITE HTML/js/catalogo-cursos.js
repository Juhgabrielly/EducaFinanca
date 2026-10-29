document.addEventListener('DOMContentLoaded', async () => {
  const grade = document.getElementById('gradeCursos');
  if (!grade) return;
  const fixos = [
    { numero: 1, titulo: 'Planejamento e Organização Financeira', pagina: 'curso1.html', premium: false },
    { numero: 2, titulo: 'Gestão de Dívidas e Créditos', pagina: 'curso2.html', premium: false },
    { numero: 3, titulo: 'Investimento', pagina: 'curso3.html', premium: false },
    { numero: 4, titulo: 'Matemática Financeira', pagina: 'curso4.html', premium: true },
    { numero: 5, titulo: 'Educação Financeira Empresarial', pagina: 'curso5.html', premium: true },
    { numero: 6, titulo: 'Psicologia Econômica', pagina: 'curso6.html', premium: true }
  ];
  if (!obterToken()) {
    grade.innerHTML = '<p>Entre na sua conta para ver os cursos disponíveis.</p>';
    return;
  }
  try {
    const [cursos, progressos] = await Promise.all([
      EducaAPI.get('/cursos/listar'),
      EducaAPI.get('/progressoCursos/listar')
    ]);
    const lista = fixos.map(fixo => {
      const curso = (cursos || []).find(item => normalizar(item.titulo) === normalizar(fixo.titulo));
      const progresso = curso ? (progressos || []).find(item => Number(item.curso_id) === Number(curso.id)) : null;
      return { ...fixo, curso, descricao: curso?.descricao || 'Continue o curso e registre seu progresso na sua conta.', percentual: Math.max(0, Math.min(100, Number(progresso?.progresso || 0))) };
    });
    // Também exibe cursos adicionais cadastrados no backend, sem substituir os seis originais.
    const extras = (cursos || []).filter(curso => !fixos.some(fixo => normalizar(fixo.titulo) === normalizar(curso.titulo))).map(curso => {
      const progresso = (progressos || []).find(item => Number(item.curso_id) === Number(curso.id));
      return { numero: null, titulo: curso.titulo, descricao: curso.descricao || 'Curso cadastrado no backend.', pagina: `curso.html?id=${encodeURIComponent(curso.id)}`, premium: Boolean(curso.exclusivo), curso, percentual: Math.max(0, Math.min(100, Number(progresso?.progresso || 0))) };
    });
    grade.innerHTML = [...lista, ...extras].map(item => {
      const usuario = obterUsuario();
      const premiumBloqueado = item.premium && (!usuario || usuario.plano !== 'PREMIUM');
      const link = item.curso ? (item.numero ? `${item.pagina}?id=${encodeURIComponent(item.curso.id)}` : item.pagina) : item.pagina;
      const acao = premiumBloqueado ? `<button class="btn-premium-curso" type="button" data-premium="true">Conhecer o Premium</button>` : `<a href="${link}" class="btn-curso">Acessar curso</a>`;
      return `<article class="card-curso"><div class="conteudo-curso"><span class="nivel-curso">${item.premium ? 'Premium' : 'Disponível'}</span><h2>${escaparHTML(item.titulo)}</h2><p>${escaparHTML(item.descricao)}</p><div class="info-curso"><span>Progresso: ${item.percentual}%</span></div><div style="height:8px;background:#e7e7e7;border-radius:8px;margin:10px 0;overflow:hidden"><div style="height:100%;width:${item.percentual}%;background:#2f806a"></div></div>${acao}${!item.curso ? '<small style="display:block;margin-top:8px">Para salvar progresso, cadastre os cursos iniciais no banco com o comando indicado no README.</small>' : ''}</div></article>`;
    }).join('');
    grade.querySelectorAll('[data-premium]').forEach(botao => botao.addEventListener('click', () => { location.href = 'plano.html'; }));
  } catch (erro) {
    // O catálogo fixo continua visível mesmo quando a API falha, para os cursos não sumirem.
    grade.innerHTML = fixos.map(item => `<article class="card-curso"><div class="conteudo-curso"><span class="nivel-curso">${item.premium ? 'Premium' : 'Disponível'}</span><h2>${escaparHTML(item.titulo)}</h2><p>Curso original preservado no site.</p><a href="${item.pagina}" class="btn-curso">Acessar curso</a></div></article>`).join('') + `<p style="grid-column:1/-1">Não foi possível sincronizar o progresso com o backend: ${escaparHTML(erro.message)}</p>`;
  }
});
function normalizar(valor) { return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function escaparHTML(valor) { return String(valor ?? '').replace(/[&<>"']/g, caractere => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caractere])); }
