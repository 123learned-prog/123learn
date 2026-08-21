"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { sessionStore } from "@/lib/session";

const QUANTIDADES = [10, 20, 30] as const;
const NIVEIS = ["iniciante", "intermediario", "avancado"] as const;

export default function EstudarPage() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [quantidade, setQuantidade] = useState<number>(10);
  const [idioma, setIdioma] = useState<"portugues" | "ingles">("portugues");
  const [nivel, setNivel] = useState<string>("intermediario");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!sessionStore.getAluno()) router.replace("/");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim().length < 30) {
      setErro("Cole um texto com pelo menos algumas frases para gerar boas questões.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/gerar-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, quantidade, idioma, nivel }),
      });
      if (!res.ok) throw new Error("Falha ao gerar as questões");
      const quiz = await res.json();
      sessionStore.setQuiz(quiz);
      router.push("/quiz");
    } catch (err) {
      setErro("Não deu pra gerar as questões agora. Tenta de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        passo={2}
        totalPassos={5}
        titulo="Cole o que você está estudando"
        subtitulo="Cole aqui o texto ou material que seu professor te passou."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <textarea
          className="focus-ring h-64 rounded-sm border border-line bg-white p-4 font-body text-graphite"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui o texto..."
        />

        <div className="grid gap-8 sm:grid-cols-3">
          <fieldset>
            <legend className="mb-2 font-mono text-xs uppercase tracking-wide text-pencil">
              Idioma
            </legend>
            <div className="flex flex-col gap-2">
              {(["portugues", "ingles"] as const).map((op) => (
                <label key={op} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="idioma"
                    checked={idioma === op}
                    onChange={() => setIdioma(op)}
                  />
                  {op === "portugues" ? "Português" : "Inglês"}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-mono text-xs uppercase tracking-wide text-pencil">
              Nível
            </legend>
            <div className="flex flex-col gap-2">
              {NIVEIS.map((n) => (
                <label key={n} className="flex items-center gap-2 text-sm capitalize">
                  <input
                    type="radio"
                    name="nivel"
                    checked={nivel === n}
                    onChange={() => setNivel(n)}
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-mono text-xs uppercase tracking-wide text-pencil">
              Questões
            </legend>
            <div className="flex flex-col gap-2">
              {QUANTIDADES.map((q) => (
                <label key={q} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="quantidade"
                    checked={quantidade === q}
                    onChange={() => setQuantidade(q)}
                  />
                  {q} questões
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {erro && <p className="text-sm text-wrong">{erro}</p>}

        <Button type="submit" disabled={carregando} className="self-start">
          {carregando ? "Gerando questões..." : "Gerar questões →"}
        </Button>
      </form>
    </main>
  );
}
