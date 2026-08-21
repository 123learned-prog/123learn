"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { sessionStore } from "@/lib/session";
import { gerarPdfResultado } from "@/lib/pdf";
import { AlunoInfo, QuizGerado, ResultadoCorrecao } from "@/lib/types";

export default function ResultadosPage() {
  const router = useRouter();
  const [aluno, setAluno] = useState<AlunoInfo | null>(null);
  const [quiz, setQuiz] = useState<QuizGerado | null>(null);
  const [resultado, setResultado] = useState<ResultadoCorrecao | null>(null);

  useEffect(() => {
    const a = sessionStore.getAluno();
    const q = sessionStore.getQuiz();
    const r = sessionStore.getResultado();
    if (!a || !q || !r) {
      router.replace("/");
      return;
    }
    setAluno(a);
    setQuiz(q);
    setResultado(r);
  }, [router]);

  if (!aluno || !quiz || !resultado) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        passo={4}
        totalPassos={5}
        titulo="Resultado"
        subtitulo={`${aluno.nome} · ${resultado.totalCertas}/${resultado.totalQuestoes} certas`}
      />

      <div className="mb-10 flex items-center gap-4 rounded-sm border border-line bg-white p-6">
        <span className="font-display text-4xl font-semibold text-board">
          {resultado.pontuacaoGeral}
          <span className="text-lg text-pencil">/10</span>
        </span>
        <p className="text-sm text-pencil">{resultado.comentarioGeral}</p>
      </div>

      <div className="flex flex-col gap-6">
        {quiz.questoes.map((q, i) => {
          const fb = resultado.feedbacks.find((f) => f.questaoId === q.id);
          const acertou = fb?.correta === true;
          const errou = fb?.correta === false;
          return (
            <div
              key={q.id}
              className={`rounded-sm border-l-4 bg-white p-4 ${
                acertou
                  ? "border-correct"
                  : errou
                  ? "border-wrong"
                  : "border-highlight"
              }`}
            >
              <p className="mb-1 font-mono text-xs uppercase tracking-wide text-pencil">
                Questão {i + 1}
                {fb?.nota !== undefined ? ` · nota ${fb.nota}/10` : ""}
                {acertou ? " · certa" : errou ? " · errada" : ""}
              </p>
              <p className="mb-2 text-sm text-graphite">{q.enunciado}</p>
              <p className="text-sm text-pencil">{fb?.comentario}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button onClick={() => gerarPdfResultado(aluno, quiz, resultado)}>
          Baixar PDF
        </Button>
        <Link href="/materia">
          <Button variant="ghost">Ver matéria para estudar →</Button>
        </Link>
      </div>
    </main>
  );
}
