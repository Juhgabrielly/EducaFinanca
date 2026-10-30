document.addEventListener('DOMContentLoaded', async () => {
  const estado = document.getElementById('estado');
  const conteudo = document.getElementById('conteudo');
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!obterToken()) { location.href = 'login.html'; return; }
  if (!Number.isInteger(id) || id <= 0) { estado.textContent = 'ID do curso inválido.'; return; }
  let cursoAtual;
  let progressoAtual = 0;
  try {
    const [curso, progressos, quizzes] = await Promise.all([
      EducaAPI.get(`/cursos/buscar/${id}`),
      EducaAPI.get('/progressoCursos/listar'),
      EducaAPI.get('/quizzes/listar')
    ]);
    cursoAtual = curso;
    const progresso = (progressos || []).find(item => Number(item.curso_id) === id);
    progressoAtual = Number(progresso?.progresso || 0);
    document.getElementById('categoria').textContent = curso.exclusivo ? 'Conteúdo Premium' : 'Curso';
    document.getElementById('titulo').textContent = curso.titulo;
    document.getElementById('descricao').textContent = curso.descricao || '';
    document.getElementById('texto').textContent = curso.conteudo || 'O conteúdo deste curso ainda não foi adicionado pelo administrador.';
    atualizarBarra(progressoAtual);
    const relacionados = (quizzes || []).filter(quiz => Number(quiz.curso_id) === id);
    const areaQuizzes = document.getElementById('quizzes');
    areaQuizzes.innerHTML = relacionados.length ? relacionados.map(quiz => `<p><strong>${escapar(quiz.titulo)}</strong><br>${escapar(quiz.descricao || '')}<br><a class="btn-primario" href="quiz.html?id=${quiz.id}">Fazer quiz</a></p>`).join('') : '<p>Este curso ainda não tem quiz cadastrado no backend.</p>';
    conteudo.hidden = false;
    estado.hidden = true;
    if (progressoAtual < 25) await salvarProgresso(25, false);
  } catch (erro) { estado.textContent = `Não foi possível carregar o curso: ${erro.message}`; }
  document.getElementById('marcarEstudo').addEventListener('click', async () => {
    try { await salvarProgresso(Math.max(progressoAtual, 50), progressoAtual >= 100); alert('Progresso salvo no backend.'); }
    catch (erro) { alert(erro.message); }
  });
  async function salvarProgresso(valor, concluido) {
    const resposta = await EducaAPI.post('/progressoCursos/cadastrar', { curso_id: id, progresso: valor, concluido });
    progressoAtual = Number(resposta.progresso);
    atualizarBarra(progressoAtual);
  }
  function atualizarBarra(valor) { document.getElementById('barraProgresso').style.width = `${valor}%`; document.getElementById('textoProgresso').textContent = `Progresso salvo: ${valor}%`; }
});
function escapar(valor) { return String(valor ?? '').replace(/[&<>"']/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere])); }
