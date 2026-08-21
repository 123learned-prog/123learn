import jsPDF from "jspdf";
import { AlunoInfo, QuizGerado, ResultadoCorrecao } from "./types";

export function gerarPdfResultado(
  aluno: AlunoInfo,
  quiz: QuizGerado,
  resultado: ResultadoCorrecao
) {
  const doc = new jsPDF({ unit: "pt" });
  const margem = 48;
  let y = margem;
  const largura = doc.internal.pageSize.getWidth() - margem * 2;

  function linha(texto: string, tamanho = 11, negrito = false, espaco = 16) {
    doc.setFontSize(tamanho);
    doc.setFont("helvetica", negrito ? "bold" : "normal");
    const partes = doc.splitTextToSize(texto, largura);
    partes.forEach((p: string) => {
      if (y > doc.internal.pageSize.getHeight() - margem) {
        doc.addPage();
        y = margem;
      }
      doc.text(p, margem, y);
      y += espaco;
    });
  }

  linha("Resultado do exercício", 18, true, 24);
  linha(`Aluno: ${aluno.nome} (${aluno.email})`, 10);
  linha(`Idioma: ${quiz.idioma} · Nível: ${quiz.nivel}`, 10);
  linha(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 10, false, 24);

  linha(
    `Pontuação geral: ${resultado.pontuacaoGeral}/10  (${resultado.totalCertas}/${resultado.totalQuestoes} certas)`,
    13,
    true,
    22
  );
  linha(resultado.comentarioGeral, 11, false, 24);

  linha("Questão a questão", 14, true, 20);
  quiz.questoes.forEach((q, i) => {
    const fb = resultado.feedbacks.find((f) => f.questaoId === q.id);
    linha(`${i + 1}. ${q.enunciado}`, 11, true);
    if (fb) {
      const status =
        fb.correta === true
          ? "Correta"
          : fb.correta === false
          ? "Incorreta"
          : `Nota: ${fb.nota}/10`;
      linha(status, 10);
      linha(fb.comentario, 10, false, 22);
    }
  });

  linha("Matéria para estudar", 14, true, 20);
  linha(resultado.materiaEstudo, 11);

  doc.save(`resultado-${aluno.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
