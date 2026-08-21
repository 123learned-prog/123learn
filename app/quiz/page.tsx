"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { sessionStore } from "@/lib/session";
import { QuizGerado, RespostaAluno } from "@/lib/types";

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizGerado | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const q = sessionStore.getQuiz();
    if (!sessionStore.getAluno() || !q) {
      router.replace("/");
      return;
    }
    setQuiz(q);
  }, [router]);

  if (!quiz) return null;

  const faltando = quiz.questoes.filter((q) => !respostas[q.id]?.trim()).length;

  async function handleSubmit() {
    if (faltando > 0) {
      setErro(`Faltam ${faltando} questões para responder.`);
      return;
    }
    setErro("");
    setEnviando(true);

    const listaRespostas: RespostaAluno[] = quiz!.questoes.map((q) => ({
      questaoId: q.id,
      resposta: respostas[q.id],
    }));
    sessionStore.setRespostas(listaRespostas);

    try {
      const aluno = sessionStore.getAluno();
      const res = await fetch("/api/corrigir-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz, respostas: listaRespostas, aluno }),
      });
      if (!res.ok) throw new Error("Falha na correção");
      const resultado = await res.json();
      sessionStore.setResultado(resultado);
      router.push("/resultados");
    } catch {
      setErro("Não deu pra corrigir agora. Tenta enviar de novo.");
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        passo={3}
        totalPassos={5}
        titulo="Responda as questões"
        subtitulo={`${quiz.questoes.length} questões · nível ${quiz.nivel}`}
      />

      <div className="flex flex-col gap-10">
        {quiz.questoes.map((q, i) => (
          <div key={q.id} className="border-b border-line pb-8">
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-pencil">
              Questão {i + 1} · {q.tipo.replace("_", " ")}
            </p>
            {q.textoApoio && (
              <p className="mb-3 rounded-sm bg-white p-3 text-sm italic text-pencil">
                {q.textoApoio}
              </p>
            )}
            <p className="mb-4 font-body text-graphite">{q.enunciado}</p>

            {q.tipo === "multipla_escolha" && q.opcoes ? (
              <div className="flex flex-col gap-2">
                {q.opcoes.map((op, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 rounded-sm border border-line bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={respostas[q.id] === String(idx)}
                      onChange={() =>
                        setRespostas((r) => ({ ...r, [q.id]: String(idx) }))
                      }
                    />
                    {op}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="focus-ring h-28 w-full rounded-sm border border-line bg-white p-3 text-sm"
                value={respostas[q.id] ?? ""}
                onChange={(e) =>
                  setRespostas((r) => ({ ...r, [q.id]: e.target.value }))
                }
                placeholder="Sua resposta..."
              />
            )}
          </div>
        ))}

        {erro && <p className="text-sm text-wrong">{erro}</p>}

        <Button onClick={handleSubmit} disabled={enviando} className="self-start">
          {enviando ? "Corrigindo..." : "Enviar respostas →"}
        </Button>
      </div>
    </main>
  );
}
