import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { QuizGerado } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { texto, quantidade, idioma, nivel } = await req.json();

  if (!texto || typeof texto !== "string" || texto.trim().length < 20) {
    return NextResponse.json({ erro: "Texto inválido" }, { status: 400 });
  }
  if (![10, 20, 30].includes(quantidade)) {
    return NextResponse.json({ erro: "Quantidade inválida" }, { status: 400 });
  }

  const idiomaLabel = idioma === "ingles" ? "inglês" : "português";

  const prompt = `Você é um professor de ${idiomaLabel} criando um exercício para um aluno de nível ${nivel}.

Texto de estudo fornecido pelo aluno:
"""
${texto}
"""

Crie exatamente ${quantidade} questões variadas em ${idiomaLabel}, baseadas nesse texto, misturando estes tipos:
- "multipla_escolha": pergunta objetiva com 4 opções (campo "opcoes"), e o índice da resposta certa em "respostaCorreta" (0 a 3).
- "interpretacao": pergunta de resposta livre que exige entender/interpretar o texto (sem "opcoes" nem "respostaCorreta").
- "leitura": pergunta de compreensão de leitura, pode reutilizar um trecho do texto em "textoApoio".

Responda APENAS com um JSON válido, sem markdown, sem texto antes ou depois, no seguinte formato:
{
  "idioma": "${idioma}",
  "nivel": "${nivel}",
  "questoes": [
    {
      "id": "q1",
      "tipo": "multipla_escolha",
      "enunciado": "...",
      "opcoes": ["...", "...", "...", "..."],
      "respostaCorreta": 0
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Resposta sem texto");
    }

    const limpo = textBlock.text.replace(/```json|```/g, "").trim();
    const quiz: QuizGerado = JSON.parse(limpo);

    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Erro ao gerar quiz:", err);
    return NextResponse.json(
      { erro: "Falha ao gerar as questões" },
      { status: 500 }
    );
  }
}
