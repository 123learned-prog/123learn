import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { QuizGerado, RespostaAluno, ResultadoCorrecao, AlunoInfo } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Cliente Supabase "service role" — só usado no servidor, nunca no browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const {
    quiz,
    respostas,
    aluno,
  }: { quiz: QuizGerado; respostas: RespostaAluno[]; aluno: AlunoInfo } =
    await req.json();

  if (!quiz || !respostas || !aluno?.email) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
  }

  const idiomaLabel = quiz.idioma === "ingles" ? "inglês" : "português";

  const prompt = `Você é um professor de ${idiomaLabel} corrigindo o exercício de um aluno de nível ${quiz.nivel}.

Aqui estão as questões (em JSON) e as respostas do aluno:

QUESTÕES:
${JSON.stringify(quiz.questoes, null, 2)}

RESPOSTAS DO ALUNO:
${JSON.stringify(respostas, null, 2)}

Instruções de correção:
- Para "multipla_escolha": compare com "respostaCorreta" (índice). Marque "correta": true/false. Não precisa de nota.
- Para "interpretacao" e "leitura" (resposta livre): dê uma nota de 0 a 10 em "nota", avaliando se a resposta mostra compreensão do texto. Seja generoso com respostas coerentes mesmo que não sejam perfeitas.
- Em "comentario", escreva SEMPRE algo construtivo: o que o aluno acertou e o que pode melhorar. Nunca deixe vazio.
- "comentarioGeral": um parágrafo curto e encorajador resumindo o desempenho.
- "materiaEstudo": um texto de estudo (pode ter alguns parágrafos e até tópicos) explicando os pontos do assunto que o aluno mais errou ou teve dificuldade, para ele revisar.

Responda APENAS com um JSON válido, sem markdown, no formato:
{
  "pontuacaoGeral": 8.5,
  "totalCertas": 7,
  "totalQuestoes": 10,
  "feedbacks": [
    { "questaoId": "q1", "correta": true, "comentario": "..." },
    { "questaoId": "q2", "correta": null, "nota": 7, "comentario": "..." }
  ],
  "comentarioGeral": "...",
  "materiaEstudo": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const texto_resposta = result.response.text();

    const limpo = texto_resposta.replace(/```json|```/g, "").trim();
    const resultado: ResultadoCorrecao = JSON.parse(limpo);

    // Salva o histórico do aluno vinculado ao email (não bloqueia a resposta se falhar).
    const { error: dbError } = await supabaseAdmin.from("resultados").insert({
      nome: aluno.nome,
      email: aluno.email,
      idioma: quiz.idioma,
      nivel: quiz.nivel,
      total_questoes: resultado.totalQuestoes,
      total_certas: resultado.totalCertas,
      pontuacao_geral: resultado.pontuacaoGeral,
      quiz: quiz,
      respostas: respostas,
      resultado: resultado,
    });
    if (dbError) console.error("Erro ao salvar no Supabase:", dbError);

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Erro ao corrigir quiz:", err);
    return NextResponse.json({ erro: "Falha ao corrigir" }, { status: 500 });
  }
}