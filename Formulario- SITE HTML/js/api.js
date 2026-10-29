// Cliente único da API EducaFinança. O token JWT acompanha todas as rotas protegidas.
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://educafinanca-backend.vercel.app';

function obterToken() { return localStorage.getItem('token'); }
function obterUsuario() {
  try { return JSON.parse(localStorage.getItem('usuario')); } catch { return null; }
}
function salvarSessao(token, usuario) {
  if (token) localStorage.setItem('token', token);
  if (usuario) localStorage.setItem('usuario', JSON.stringify(usuario));
}
function encerrarSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
async function requisicaoAPI(caminho, opcoes = {}) {
  const cabecalhos = { ...(opcoes.headers || {}) };
  if (opcoes.body && !cabecalhos['Content-Type']) cabecalhos['Content-Type'] = 'application/json';
  const token = obterToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers: cabecalhos });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o backend está funcionando.');
  }
  const tipo = resposta.headers.get('content-type') || '';
  const dados = tipo.includes('application/json') ? await resposta.json() : await resposta.text();
  if (!resposta.ok) {
    if (resposta.status === 401 && token) encerrarSessao();
    throw new Error((dados && (dados.erro || dados.mensagem)) || `Erro HTTP ${resposta.status}`);
  }
  return dados;
}
window.EducaAPI = {
  url: API_URL,
  get: caminho => requisicaoAPI(caminho),
  post: (caminho, dados) => requisicaoAPI(caminho, { method: 'POST', body: JSON.stringify(dados) }),
  put: (caminho, dados) => requisicaoAPI(caminho, { method: 'PUT', body: JSON.stringify(dados) }),
  delete: caminho => requisicaoAPI(caminho, { method: 'DELETE' })
};
