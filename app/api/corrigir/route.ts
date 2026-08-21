import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  AlunoInfo,
  FeedbackQuestao,
  QuizGerado,
  RespostaAluno,
  ResultadoCorrecao,
} from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quiz: QuizGerado = body.quiz;
  const respostas: RespostaAluno[] = body.respostas;
  const aluno: AlunoInfo = body.aluno;
  const textoOriginal: string = body.textoOriginal ?? "";

  if (!quiz || !respostas || !aluno?.email) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
  }

  const respostaPorId = new Map(respostas.map((r) => [r.questaoId, r.resposta]));

  // 1) Corrige múltipla escolha localmente — não precisa de IA, é determinístico.
  const feedbacksObjetivos: FeedbackQuestao[] = [];
  const questoesAbertas = quiz.questoes.filter((q) => q.tipo !== "multipla_escolha");

  for (const q of quiz.questoes) {
    if (q.tipo === "multipla_escolha") {
      const respostaAluno = respostaPorId.get(q.id);
      const correta = Number(respostaAluno) === q.respostaCorreta;
      feedbacksObjetivos.push({
        questaoId: q.id,
        correta,
        comentario: correta
          ? "Resposta correta."
          : `Resposta correta: "${q.opcoes?.[q.respostaCorreta ?? -1] ?? "-"}".`,
      });
    }
  }

  // 2) Corrige questões abertas (interpretação/leitura) com IA: nota 0-10 + comentário.
  let feedbacksAbertos: FeedbackQuestao[] = [];
  let materiaEstudo = "";

  if (questoesAbertas.length > 0 || true) {
    const listaAbertas = questoesAbertas
      .map(
        (q) =>
          `ID: ${q.id}\nPergunta: ${q.enunciado}${q.textoApoio ? `\nTrecho de apoio: ${q.textoApoio}` : ""}\nResposta do aluno: ${respostaPorId.get(q.id) || "(em branco)"}`
      )
      .join("\n\n");

    const prompt = `Você é um professor corrigindo o exercício de um aluno.

Texto original que o aluno estudou:
"""
${textoOriginal}
"""

${questoesAbertas.length > 0 ? `Questões abertas (interpretação/leitura) e as respostas do aluno:\n${listaAbertas}` : "Não há questões abertas neste exercício."}

Tarefas:
1. Para CADA questão aberta listada acima, dê uma nota de 0 a 10 e um comentário curto (2-3 frases) dizendo o que a resposta acertou e o que pode melhorar. Seja gentil e construtivo, mas honesto.
2. Escreva um "materiaEstudo": um texto de estudo (200-400 palavras) explicando os pontos principais do texto original, para o aluno revisar depois do exercício — como se fosse material de apoio para a próxima aula.

Responda APENAS com JSON válido, sem markdown, neste formato:
{
  "feedbacksAbertos": [
    { "questaoId": "q2", "nota": 7, "comentario": "..." }
  ],
  "materiaEstudo": "..."
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      const limpo = textBlock.text.replace(/```json|```/g, "").trim();
      try {
        const parsed = JSON.parse(limpo);
        feedbacksAbertos = (parsed.feedbacksAbertos ?? []).map((f: any) => ({
          questaoId: f.questaoId,
          correta: null,
          nota: f.nota,
          comentario: f.comentario,
        }));
        materiaEstudo = parsed.materiaEstudo ?? "";
      } catch (e) {
        console.error("Falha ao interpretar correção da IA:", e);
      }
    }
  }

  const feedbacks = [...feedbacksObjetivos, ...feedbacksAbertos];

  const totalObjetivas = feedbacksObjetivos.length;
  const totalCertasObjetivas = feedbacksObjetivos.filter((f) => f.correta).length;
  const mediaAbertas =
    feedbacksAbertos.length > 0
      ? feedbacksAbertos.reduce((acc, f) => acc + (f.nota ?? 0), 0) / feedbacksAbertos.length
      : null;
  const percentualObjetivas =
    totalObjetivas > 0 ? (totalCertasObjetivas / totalObjetivas) * 10 : null;

  const partes = [percentualObjetivas, mediaAbertas].filter(
    (v): v is number => v !== null
  );
  const pontuacaoGeral =
    partes.length > 0 ? Math.round((partes.reduce((a, b) => a + b, 0) / partes.length) * 10) / 10 : 0;

  const resultado: ResultadoCorrecao = {
    pontuacaoGeral,
    totalCertas: totalCertasObjetivas,
    totalQuestoes: quiz.questoes.length,
    feedbacks,
    comentarioGeral:
      pontuacaoGeral >= 8
        ? "Excelente resultado! Você demonstrou bom domínio do conteúdo."
        : pontuacaoGeral >= 6
        ? "Bom resultado, com alguns pontos para reforçar — veja os comentários abaixo."
        : "Vale revisar o material de estudo com calma antes da próxima aula.",
    materiaEstudo,
  };

  // 3) Salva no Supabase, associado ao email do aluno (histórico de progresso).
  try {
    await supabaseServer.from("quiz_sessions").insert({
      aluno_nome: aluno.nome,
      aluno_email: aluno.email,
      idioma: quiz.idioma,
      nivel: quiz.nivel,
      texto_original: textoOriginal,
      questoes: quiz.questoes,
      respostas,
      resultado,
    });
  } catch (e) {
    // Não bloqueia o aluno de ver o resultado se o salvamento falhar.
    console.error("Falha ao salvar sessão no Supabase:", e);
  }

  return NextResponse.json(resultado);
}
