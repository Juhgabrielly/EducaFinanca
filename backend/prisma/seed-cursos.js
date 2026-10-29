// Popula os seis cursos originais do site sem mover os vídeos para o backend.
// Seguro para executar mais de uma vez: não duplica cursos, quizzes ou perguntas já cadastrados.
const prisma = require('../src/data/prisma');
const conteudo = {
  "courses": [
    {
      "numero": 1,
      "titulo": "Planejamento e Organização Financeira",
      "descricao": "Neste curso você aprenderá a estruturar suas finanças pessoais e familiares, criando um plano sólido para alcançar estabilidade, segurança e liberdade financeira.",
      "exclusivo": false
    },
    {
      "numero": 2,
      "titulo": "Gestão de Dívidas e Créditos",
      "descricao": "Neste curso você aprenderá a compreender e organizar suas dívidas, utilizar o crédito de maneira consciente e desenvolver estratégias para melhorar sua situação financeira.",
      "exclusivo": false
    },
    {
      "numero": 3,
      "titulo": "Investimento",
      "descricao": "Neste curso você aprenderá conceitos fundamentais sobre investimentos, classes de ativos, riscos e planejamento financeiro para tomar decisões de forma mais consciente.",
      "exclusivo": false
    },
    {
      "numero": 4,
      "titulo": "Matemática Financeira",
      "descricao": "Neste curso você aprenderá os principais conceitos de matemática financeira, compreendendo juros, capitalização, fluxo de caixa, séries de pagamentos e sistemas de amortização.",
      "exclusivo": true
    },
    {
      "numero": 5,
      "titulo": "Educação Financeira Empresarial",
      "descricao": "Neste curso você aprenderá os principais conceitos de organização financeira empresarial, controle de custos, fluxo de caixa, planejamento estratégico e gestão de dívidas.",
      "exclusivo": true
    },
    {
      "numero": 6,
      "titulo": "Psicologia Econômica",
      "descricao": "Neste curso você aprenderá como fatores emocionais, sociais e comportamentais influenciam as decisões financeiras, o consumo e a relação das pessoas com o dinheiro.",
      "exclusivo": true
    }
  ],
  "quizzes": [
    {
      "numero": 1,
      "titulo": "Quiz de Planejamento e Organização Financeira",
      "descricao": "Quiz original do curso Planejamento e Organização Financeira. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "Quais são os principais métodos de organização financeira apresentados no vídeo para quem tem uma renda baixa?",
          "resposta_correta": "B: Métodos simplificados de organização e planejamento financeiro, focados na renda e despesas mensais."
        },
        {
          "pergunta": "Como o vídeo sugere a criação de um planejamento financeiro com base na renda e nas despesas mensais?",
          "resposta_correta": "C: Apresentando formas de organizar a renda e as despesas de maneira direta e acessível."
        },
        {
          "pergunta": "De que forma o vídeo simplifica o conceito de planejamento financeiro pessoal?",
          "resposta_correta": "B: Através de explicações visuais e métodos práticos que não exigem cálculos complicados."
        }
      ]
    },
    {
      "numero": 2,
      "titulo": "Quiz de Gestão de Dívidas e Crédito",
      "descricao": "Quiz original do curso Gestão de Dívidas e Créditos. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "Qual técnica principal é mencionada no vídeo para quitar dívidas, adaptada à realidade brasileira?",
          "resposta_correta": "B: O método de Dave Ramsey."
        },
        {
          "pergunta": "Além de quitar as dívidas, qual é o próximo passo importante abordado no vídeo para a saúde financeira?",
          "resposta_correta": "C: Alcançar o equilíbrio financeiro."
        },
        {
          "pergunta": "O vídeo sugere que, para quem está bastante endividado, quitar as dívidas implica em:",
          "resposta_correta": "B: Mudar a forma como se lida com as finanças pessoais."
        }
      ]
    },
    {
      "numero": 3,
      "titulo": "Quiz sobre Investimentos",
      "descricao": "Quiz original do curso Investimento. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "O que o vídeo explica sobre a renda fixa?",
          "resposta_correta": "B: Representa empréstimos, sendo um investimento mais conservador comparado à renda variável."
        },
        {
          "pergunta": "Quais são os tipos de investimentos em renda fixa mencionados no vídeo?",
          "resposta_correta": "B: CDI, CDB, SELIC, LCI e LCA."
        },
        {
          "pergunta": "De acordo com o vídeo, qual o rendimento aproximado da renda fixa em 2024, no momento da postagem?",
          "resposta_correta": "B: Cerca de 10% ao ano."
        }
      ]
    },
    {
      "numero": 4,
      "titulo": "Quiz de Matemática Financeira",
      "descricao": "Quiz original do curso Matemática Financeira. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "Qual método é destacado no vídeo para aprender matemática financeira de forma fácil e rápida?",
          "resposta_correta": "B: Método de Curió."
        },
        {
          "pergunta": "O vídeo foca em quais conceitos fundamentais da matemática financeira?",
          "resposta_correta": "B: Porcentagem e juros simples."
        },
        {
          "pergunta": "Qual é o principal objetivo do “CURIÓ METHOD” mencionado no vídeo?",
          "resposta_correta": "A: Tornar a matemática complexa mais acessível e de fácil absorção."
        }
      ]
    },
    {
      "numero": 5,
      "titulo": "Quiz de Educação Financeira Empresarial",
      "descricao": "Quiz original do curso Educação Financeira Empresarial. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "O vídeo sugere que oferecer educação financeira para os colaboradores é:",
          "resposta_correta": "B: Uma oportunidade para as empresas consolidarem boas práticas de gestão."
        },
        {
          "pergunta": "Qual é o tema central do vídeo?",
          "resposta_correta": "B: A importância da educação financeira como um benefício e necessidade para as empresas."
        },
        {
          "pergunta": "Qual o tema principal abordado no vídeo, além da educação financeira corporativa?",
          "resposta_correta": "D: O vídeo foca exclusivamente na perspectiva empresarial da educação financeira."
        }
      ]
    },
    {
      "numero": 6,
      "titulo": "Quiz sobre Psicologia Econômica",
      "descricao": "Quiz original do curso Psicologia Econômica. As perguntas e respostas corretas ficam registradas no banco.",
      "questions": [
        {
          "pergunta": "Qual é a principal ideia central do vídeo sobre o comportamento financeiro?",
          "resposta_correta": "B: O comportamento e a mentalidade influenciam diretamente as decisões financeiras."
        },
        {
          "pergunta": "O vídeo sugere que a mentalidade financeira impacta principalmente:",
          "resposta_correta": "C: A forma como a pessoa decide gastar, poupar e investir."
        },
        {
          "pergunta": "Qual é o papel da mudança de mentalidade no contexto financeiro?",
          "resposta_correta": "C: Melhorar a qualidade das decisões financeiras ao longo do tempo."
        }
      ]
    }
  ]
};

async function main() {
  for (const item of conteudo.courses) {
    let curso = await prisma.cursos.findFirst({ where: { titulo: item.titulo } });
    if (!curso) {
      curso = await prisma.cursos.create({ data: { titulo: item.titulo, descricao: item.descricao, conteudo: 'As aulas e os vídeos permanecem nas páginas originais do frontend. Este registro conecta o curso ao progresso e aos quizzes no banco.', exclusivo: item.exclusivo } });
      console.log(`Curso criado: ${curso.titulo} (ID ${curso.id})`);
    } else {
      console.log(`Curso já existe: ${curso.titulo} (ID ${curso.id})`);
    }
    const quizInfo = conteudo.quizzes.find(q => q.numero === item.numero);
    let quiz = await prisma.quizzes.findFirst({ where: { curso_id: curso.id, titulo: quizInfo.titulo } });
    if (!quiz) {
      quiz = await prisma.quizzes.create({ data: { curso_id: curso.id, titulo: quizInfo.titulo, descricao: quizInfo.descricao, exclusivo: item.exclusivo } });
      console.log(`Quiz criado: ${quiz.titulo} (ID ${quiz.id})`);
    }
    const total = await prisma.questoes.count({ where: { quiz_id: quiz.id } });
    if (total === 0) {
      for (const questao of quizInfo.questions) {
        await prisma.questoes.create({ data: { quiz_id: quiz.id, pergunta: questao.pergunta, resposta_correta: questao.resposta_correta } });
      }
      console.log(`${quizInfo.questions.length} perguntas originais cadastradas para ${quiz.titulo}`);
    } else {
      console.log(`Quiz ${quiz.titulo} já possui ${total} pergunta(s); nada foi sobrescrito.`);
    }
  }
}

main().catch(error => { console.error('Erro ao cadastrar cursos iniciais:', error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
