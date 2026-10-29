document.addEventListener('DOMContentLoaded', async () => {
  const id = Number(new URLSearchParams(location.search).get('id'));
  const estado = document.getElementById('estado');
  const form = document.getElementById('formQuiz');
  if (!obterToken()) { location.href = 'login.html'; return; }
  if (!Number.isInteger(id) || id <= 0) { estado.textContent = 'ID do quiz inválido.'; return; }
  try {
    const [quiz, questoes] = await Promise.all([EducaAPI.get(`/quizzes/buscar/${id}`), EducaAPI.get(`/questoes/quiz/${id}`)]);
    if (!questoes.length) { estado.textContent = 'Este quiz ainda não possui perguntas cadastradas no backend.'; return; }
    document.getElementById('titulo').textContent = quiz.titulo;
    document.getElementById('descricao').textContent = quiz.descricao || '';
    form.innerHTML = questoes.map((questao, indice) => `<section class="pergunta-api"><p><strong>${indice + 1}. ${escapar(questao.pergunta)}</strong></p><label for="resposta-${questao.id}">Sua resposta</label><input id="resposta-${questao.id}" name="resposta-${questao.id}" autocomplete="off" required></section>`).join('') + '<button class="btn-api" type="submit">Enviar respostas</button>';
    estado.hidden = true;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      botao.disabled = true;
      const respostas = questoes.map(questao => ({ questao_id: questao.id, resposta: document.getElementById(`resposta-${questao.id}`).value }));
      try {
        const resultado = await EducaAPI.post('/resultadosQuiz/cadastrar', { quiz_id: id, respostas });
        document.getElementById('retorno').textContent = `Resultado salvo no backend: ${resultado.acertos}/${resultado.total} acertos — ${resultado.pontuacao}%.`;
        form.innerHTML = '<a class="btn-api" href="cursos.html">Voltar aos cursos</a>';
        if (quiz.curso_id) await EducaAPI.post('/progressoCursos/cadastrar', { curso_id: Number(quiz.curso_id), progresso: 100, concluido: true });
      } catch (erro) { document.getElementById('retorno').textContent = erro.message; botao.disabled = false; }
    });
  } catch (erro) { estado.textContent = `Não foi possível carregar o quiz: ${erro.message}`; }
});
function escapar(valor) { return String(valor ?? '').replace(/[&<>"']/g, caractere => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caractere])); }
